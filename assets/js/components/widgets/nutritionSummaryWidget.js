
/**
 * Nutrition Summary Widget
 */

import { BaseWidget } from './baseWidget.js';
import { renderCircularProgress, animateCircularProgress } from '../circularProgress.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class NutritionSummaryWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-nutrition-summary', ...options });
  }

  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 30px; width: 200px; margin-bottom: 16px;"></div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
          <div class="skeleton" style="height: 140px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 140px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 140px; border-radius: 12px;"></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
        </div>
      </div>
    `;
  }

  getColor(percentage) {
    if (percentage < 70) return 'var(--color-success)';
    if (percentage < 100) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  getContentHTML(data) {
    const { totals, goals } = data;

    const caloriesPercent = Math.min(100, Math.max(0, (totals.calories / goals.calories) * 100));
    const proteinPercent = Math.min(100, Math.max(0, (totals.protein / goals.protein) * 100));
    const carbsPercent = Math.min(100, Math.max(0, (totals.carbs / goals.carbs) * 100));

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Today's Nutrition</h3>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="text-align: center; padding: 16px; margin: 0;">
            <div class="circular-progress-container" style="position: relative; display: inline-block;">
              ${renderCircularProgress({
                value: caloriesPercent,
                color: this.getColor(caloriesPercent),
                size: 100,
                strokeWidth: 8
              })}
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 18px; font-weight: 700;">${totals.calories}</span>
                <span style="font-size: 12px; color: var(--color-text-muted);">kcal</span>
              </div>
            </div>
            <div style="margin-top: 12px;">
              <div style="font-size: 14px; color: var(--color-text-muted);">Calories</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">${Math.round(goals.calories - totals.calories)} left</div>
            </div>
          </div>

          <div class="card" style="text-align: center; padding: 16px; margin: 0;">
            <div class="circular-progress-container" style="position: relative; display: inline-block;">
              ${renderCircularProgress({
                value: proteinPercent,
                color: this.getColor(proteinPercent),
                size: 100,
                strokeWidth: 8
              })}
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 18px; font-weight: 700;">${totals.protein.toFixed(1)}</span>
                <span style="font-size: 12px; color: var(--color-text-muted);">g</span>
              </div>
            </div>
            <div style="margin-top: 12px;">
              <div style="font-size: 14px; color: var(--color-text-muted);">Protein</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">${Math.max(0, (goals.protein - totals.protein)).toFixed(1)}g left</div>
            </div>
          </div>

          <div class="card" style="text-align: center; padding: 16px; margin: 0;">
            <div class="circular-progress-container" style="position: relative; display: inline-block;">
              ${renderCircularProgress({
                value: carbsPercent,
                color: this.getColor(carbsPercent),
                size: 100,
                strokeWidth: 8
              })}
              <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 18px; font-weight: 700;">${totals.carbs.toFixed(1)}</span>
                <span style="font-size: 12px; color: var(--color-text-muted);">g</span>
              </div>
            </div>
            <div style="margin-top: 12px;">
              <div style="font-size: 14px; color: var(--color-text-muted);">Carbs</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">${Math.max(0, (goals.carbs - totals.carbs)).toFixed(1)}g left</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div class="card" style="padding: 12px; margin: 0;">
            <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Fat</div>
            <div style="font-size: 18px; font-weight: 700;">${totals.fat.toFixed(1)}g</div>
          </div>
          <div class="card" style="padding: 12px; margin: 0;">
            <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Fiber</div>
            <div style="font-size: 18px; font-weight: 700;">${totals.fiber.toFixed(1)}g</div>
          </div>
          <div class="card" style="padding: 12px; margin: 0;">
            <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Water</div>
            <div style="font-size: 18px; font-weight: 700;">${totals.water.toFixed(1)}L</div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const containers = this.container.querySelectorAll('.circular-progress-container');
    containers.forEach(container => {
      animateCircularProgress(container);
    });
  }

  async loadData() {
    const today = toDateString();
    const nutritionResult = await nutritionRepository.getByDate(today);
    const settingsResult = await settingsRepository.getSettings();

    const totals = nutritionResult.success && nutritionResult.data ? nutritionResult.data.totals : {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      water: 0
    };

    const goals = {
      calories: settingsResult.success && settingsResult.data?.caloriesGoal ? settingsResult.data.caloriesGoal : 2000,
      protein: settingsResult.success && settingsResult.data?.proteinGoal ? settingsResult.data.proteinGoal : 150,
      carbs: settingsResult.success && settingsResult.data?.carbsGoal ? settingsResult.data.carbsGoal : 250
    };

    return { totals, goals };
  }
}

