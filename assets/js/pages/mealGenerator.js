/**
 * Meal Generator Page
 */

import mealGeneratorService from '../services/mealGeneratorService.js';

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
};

function renderStatusCard(message, isError = false) {
  return `
    <div class="card" style="padding: 16px; border-color: ${isError ? 'var(--color-danger)' : 'var(--color-primary)'}; background: ${isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)'}; color: ${isError ? 'var(--color-danger)' : 'var(--color-text-primary)'};">
      ${message}
    </div>
  `;
}

function getFriendlyErrorMessage(error) {
  const message = error?.message || 'Failed to generate meal plan.';
  if (message.includes('Nutrition goals are not configured')) {
    return 'Set your nutrition goals first, then generate your meal plan.';
  }
  if (message.includes('No catalog foods are available')) {
    return 'No eligible foods are available. Update Food Preferences and try again.';
  }
  return message;
}

function renderMealItem(item) {
  return `
    <div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover);">
      <div style="display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 10px;">
        <div>
          <div style="font-size: 15px; font-weight: 700;">${item.name}</div>
          ${item.arabicName ? `<div style="font-size: 13px; color: var(--color-text-muted);">${item.arabicName}</div>` : ''}
        </div>
        <div style="font-size: 13px; color: var(--color-text-secondary); font-weight: 600;">${item.grams} g</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--color-text-muted);">Calories</div>
          <div style="font-size: 13px; font-weight: 700;">${item.calories}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--color-text-muted);">Protein</div>
          <div style="font-size: 13px; font-weight: 700;">${item.protein}g</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--color-text-muted);">Carbs</div>
          <div style="font-size: 13px; font-weight: 700;">${item.carbs}g</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--color-text-muted);">Fat</div>
          <div style="font-size: 13px; font-weight: 700;">${item.fat}g</div>
        </div>
      </div>
    </div>
  `;
}

function renderMealCard(mealKey, items) {
  return `
    <div class="card" style="padding: 20px; margin: 0;">
      <div style="margin-bottom: 14px;">
        <h2 style="margin: 0 0 4px 0; font-size: 18px;">${MEAL_LABELS[mealKey]}</h2>
        <p style="margin: 0; color: var(--color-text-muted); font-size: 13px;">${items.length ? `${items.length} food item${items.length === 1 ? '' : 's'}` : 'No foods generated.'}</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${items.length ? items.map(renderMealItem).join('') : '<div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover); color: var(--color-text-muted);">No foods generated.</div>'}
      </div>
    </div>
  `;
}

function renderTotals(totals) {
  return `
    <div class="card" style="padding: 20px;">
      <h2 style="margin: 0 0 14px 0; font-size: 18px;">Totals</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
        <div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover); text-align: center;">
          <div style="font-size: 12px; color: var(--color-text-muted);">Calories</div>
          <div style="font-size: 20px; font-weight: 700;">${totals.calories}</div>
        </div>
        <div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover); text-align: center;">
          <div style="font-size: 12px; color: var(--color-text-muted);">Protein</div>
          <div style="font-size: 20px; font-weight: 700;">${totals.protein}g</div>
        </div>
        <div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover); text-align: center;">
          <div style="font-size: 12px; color: var(--color-text-muted);">Carbs</div>
          <div style="font-size: 20px; font-weight: 700;">${totals.carbs}g</div>
        </div>
        <div style="padding: 14px; border-radius: 14px; background: var(--color-card-hover); text-align: center;">
          <div style="font-size: 12px; color: var(--color-text-muted);">Fat</div>
          <div style="font-size: 20px; font-weight: 700;">${totals.fat}g</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render meal generator page
 * @returns {HTMLElement}
 */
export function renderMealGenerator() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Weekly Meal Generator</h1>
      <p class="page-subtitle">Generate a meal plan based on your nutrition goals and food preferences.</p>
    </div>
  `;

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '16px';
  page.appendChild(content);

  let currentPlan = null;

  function render() {
    content.innerHTML = `
      <div class="card" style="padding: 20px;">
        <button id="generate-meal-plan-btn" class="btn btn-primary" aria-label="Generate meal plan">Generate Meal Plan</button>
      </div>
    `;

    if (!currentPlan) {
      content.innerHTML += `
        <div class="card" style="padding: 32px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 12px;">🍽️</div>
          <h2 style="margin: 0 0 6px 0; font-size: 20px;">No meal plan generated yet.</h2>
        </div>
      `;
    } else {
      content.innerHTML += `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${renderMealCard('breakfast', currentPlan.breakfast || [])}
          ${renderMealCard('lunch', currentPlan.lunch || [])}
          ${renderMealCard('dinner', currentPlan.dinner || [])}
          ${renderMealCard('snack', currentPlan.snack || [])}
        </div>
        ${renderTotals(currentPlan.totals)}
      `;
    }

    const generateButton = content.querySelector('#generate-meal-plan-btn');
    generateButton.addEventListener('click', generateMealPlan);
  }

  async function generateMealPlan() {
    const buttonCard = content.querySelector('.card');
    const generateButton = content.querySelector('#generate-meal-plan-btn');
    if (generateButton) {
      generateButton.disabled = true;
      generateButton.textContent = 'Generating...';
    }

    const existingStatus = content.querySelector('[data-meal-generator-status]');
    if (existingStatus) {
      existingStatus.remove();
    }

    try {
      currentPlan = await mealGeneratorService.generateMealPlan();
      render();
    } catch (error) {
      if (buttonCard) {
        const statusWrapper = document.createElement('div');
        statusWrapper.dataset.mealGeneratorStatus = 'true';
        statusWrapper.innerHTML = renderStatusCard(getFriendlyErrorMessage(error), true);
        buttonCard.insertAdjacentElement('afterend', statusWrapper);
      }
      if (generateButton) {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Meal Plan';
      }
    }
  }

  render();

  return page;
}
