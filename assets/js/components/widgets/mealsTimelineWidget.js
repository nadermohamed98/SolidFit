
/**
 * Meals Timeline Widget
 */

import { BaseWidget } from './baseWidget.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import { showMealModal } from '../mealModal.js';
import { toDateString } from '../../utils/date.js';

export class MealsTimelineWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-meals-timeline', ...options });
  }

  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 150px; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 100px; border-radius: 12px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 100px; border-radius: 12px;"></div>
      </div>
    `;
  }

  getEmptyStateHTML() {
    return `
      <div style="padding: 40px 24px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">🍽️</div>
        <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No meals logged today</h4>
        <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Add your first meal to get started!</p>
      </div>
    `;
  }

  getContentHTML(data) {
    const { meals } = data;

    if (!meals || meals.length === 0) {
      return `
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Meals</h3>
          </div>
          ${this.getEmptyStateHTML()}
        </div>
      `;
    }

    // Sort meals by time
    const sortedMeals = [...meals].sort((a, b) => a.time.localeCompare(b.time));

    return `
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Meals</h3>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${sortedMeals.map(meal => `
            <div class="card meal-card" data-meal-id="${meal.id}" style="margin: 0; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${meal.mealName}</h4>
                    <span style="font-size: 12px; color: var(--color-text-muted);">${meal.time}</span>
                    ${meal.notes ? '<span style="font-size: 12px; color: var(--color-text-muted);">📝</span>' : ''}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--color-text-secondary);">
                    <span>🔥 ${meal.calories} kcal</span>
                    <span>🥩 ${meal.protein.toFixed(1)}g protein</span>
                    <span>🍞 ${meal.carbs.toFixed(1)}g carbs</span>
                    <span>🧈 ${meal.fat.toFixed(1)}g fat</span>
                    ${meal.fiber > 0 ? `<span>🌾 ${meal.fiber.toFixed(1)}g fiber</span>` : ''}
                    ${meal.water > 0 ? `<span>💧 ${meal.water.toFixed(1)}L water</span>` : ''}
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-icon btn-small edit-meal" data-meal-id="${meal.id}" aria-label="Edit">
                    ✏️
                  </button>
                  <button class="btn btn-icon btn-small delete-meal" data-meal-id="${meal.id}" aria-label="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const editButtons = this.container.querySelectorAll('.edit-meal');
    editButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const mealId = btn.getAttribute('data-meal-id');
        const today = toDateString();
        const nutritionResult = await nutritionRepository.getByDate(today);
        if (nutritionResult.success && nutritionResult.data) {
          const meal = nutritionResult.data.meals.find(m => m.id === mealId);
          if (meal) {
            showMealModal({ meal });
          }
        }
      });
    });

    const deleteButtons = this.container.querySelectorAll('.delete-meal');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        const mealId = btn.getAttribute('data-meal-id');
        const result = await nutritionRepository.deleteMeal(mealId);
        if (!result.success) {
          alert(result.error);
        }
      });
    });
  }

  async loadData() {
    const today = toDateString();
    const nutritionResult = await nutritionRepository.getByDate(today);
    const meals = nutritionResult.success && nutritionResult.data ? nutritionResult.data.meals : [];
    return { meals };
  }
}
