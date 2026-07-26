/**
 * Nutrition Goals Page
 */

import settingsRepository from '../repositories/settingsRepository.js';

function createField({ id, label, value = '', min, max, step = 1, placeholder = '' }) {
  return `
    <div class="input-group" style="margin-bottom: 0;">
      <label class="input-label" for="${id}">${label}</label>
      <input
        id="${id}"
        class="input-field"
        type="number"
        value="${value ?? ''}"
        min="${min}"
        max="${max}"
        step="${step}"
        placeholder="${placeholder}"
      >
    </div>
  `;
}

function formatUpdatedAt(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString();
}

function validateGoals(goals) {
  const rules = [
    ['Daily Calories', goals.calories, 1000, 6000],
    ['Protein', goals.protein, 20, 400],
    ['Carbs', goals.carbs, 20, 700],
    ['Fat', goals.fat, 10, 200],
    ['Water Goal', goals.water, 1, 10]
  ];

  for (const [label, value, min, max] of rules) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return `${label} must be a valid number.`;
    }
    if (value < min || value > max) {
      return `${label} must be between ${min} and ${max}.`;
    }
  }

  return null;
}

/**
 * Render nutrition goals page
 * @returns {HTMLElement}
 */
export function renderNutritionGoals() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Nutrition Goals</h1>
      <p class="page-subtitle">Edit and store your daily nutrition targets.</p>
    </div>
  `;

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '16px';
  page.appendChild(content);

  let currentSettings = null;

  function renderStatus(message, isError = false) {
    const status = document.createElement('div');
    status.className = 'card';
    status.style.padding = '16px';
    status.style.borderColor = isError ? 'var(--color-danger)' : 'var(--color-primary)';
    status.style.background = isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)';
    status.style.color = isError ? 'var(--color-danger)' : 'var(--color-text-primary)';
    status.textContent = message;
    return status;
  }

  function getCurrentGoals() {
    const storedGoals = currentSettings?.nutritionGoals || {};
    return {
      calories: storedGoals.calories ?? currentSettings?.caloriesGoal ?? '',
      protein: storedGoals.protein ?? currentSettings?.proteinGoal ?? '',
      carbs: storedGoals.carbs ?? currentSettings?.carbsGoal ?? '',
      fat: storedGoals.fat ?? currentSettings?.fatGoal ?? '',
      water: storedGoals.water ?? currentSettings?.waterGoal ?? '',
      updatedAt: storedGoals.updatedAt || null
    };
  }

  function renderForm() {
    const goals = getCurrentGoals();
    content.innerHTML = `
      <div class="card" style="padding: 24px;">
        <form id="nutrition-goals-form" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            ${createField({
              id: 'goal-calories',
              label: 'Daily Calories (kcal)',
              value: goals.calories,
              min: 1000,
              max: 6000,
              step: 1,
              placeholder: 'e.g. 2200'
            })}
            ${createField({
              id: 'goal-protein',
              label: 'Protein (g)',
              value: goals.protein,
              min: 20,
              max: 400,
              step: 1,
              placeholder: 'e.g. 160'
            })}
            ${createField({
              id: 'goal-carbs',
              label: 'Carbs (g)',
              value: goals.carbs,
              min: 20,
              max: 700,
              step: 1,
              placeholder: 'e.g. 250'
            })}
            ${createField({
              id: 'goal-fat',
              label: 'Fat (g)',
              value: goals.fat,
              min: 10,
              max: 200,
              step: 1,
              placeholder: 'e.g. 70'
            })}
            ${createField({
              id: 'goal-water',
              label: 'Water Goal (liters)',
              value: goals.water,
              min: 1,
              max: 10,
              step: 0.1,
              placeholder: 'e.g. 2.5'
            })}
          </div>

          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="font-size: 14px; color: var(--color-text-muted);">
              Last Updated: <strong>${formatUpdatedAt(goals.updatedAt)}</strong>
            </div>
            <button type="submit" class="btn btn-primary" aria-label="Save nutrition goals">Save</button>
          </div>
        </form>
      </div>
    `;

    const form = content.querySelector('#nutrition-goals-form');
    form.addEventListener('submit', saveGoals);
  }

  async function saveGoals(event) {
    event.preventDefault();

    const form = content.querySelector('#nutrition-goals-form');
    if (!form) return;

    const goals = {
      calories: parseInt(form.querySelector('#goal-calories').value, 10),
      protein: parseInt(form.querySelector('#goal-protein').value, 10),
      carbs: parseInt(form.querySelector('#goal-carbs').value, 10),
      fat: parseInt(form.querySelector('#goal-fat').value, 10),
      water: parseFloat(form.querySelector('#goal-water').value),
      updatedAt: new Date().toISOString()
    };

    const validationError = validateGoals(goals);
    const existingStatus = content.querySelector('[data-goals-status]');
    if (existingStatus) {
      existingStatus.remove();
    }

    if (validationError) {
      const status = renderStatus(validationError, true);
      status.dataset.goalsStatus = 'true';
      content.prepend(status);
      return;
    }

    const result = await settingsRepository.saveSettings({
      ...(currentSettings || {}),
      nutritionGoals: goals,
      caloriesGoal: goals.calories,
      proteinGoal: goals.protein,
      carbsGoal: goals.carbs,
      fatGoal: goals.fat,
      waterGoal: goals.water
    });

    if (!result.success) {
      const status = renderStatus(result.error || 'Failed to save nutrition goals.', true);
      status.dataset.goalsStatus = 'true';
      content.prepend(status);
      return;
    }

    currentSettings = result.data;
    renderForm();
    const status = renderStatus('Nutrition goals saved successfully.');
    status.dataset.goalsStatus = 'true';
    content.prepend(status);
  }

  async function loadGoals() {
    content.innerHTML = `
      <div class="card" style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 220px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 12px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 72%; border-radius: 6px;"></div>
      </div>
    `;

    const result = await settingsRepository.getSettings();
    currentSettings = result.success ? result.data : null;

    renderForm();

    if (!result.success) {
      const status = renderStatus(result.error || 'Failed to load nutrition goals.', true);
      status.dataset.goalsStatus = 'true';
      content.prepend(status);
    }
  }

  loadGoals();

  return page;
}
