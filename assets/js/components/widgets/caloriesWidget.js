
/**
 * Calories Widget
 */

import { BaseWidget } from './baseWidget.js';
import { renderCircularProgress, animateCircularProgress } from '../circularProgress.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class CaloriesWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-calories', ...options });
  }

  /**
   * Get progress color
   * @param {number} percentage
   */
  getColor(percentage) {
    if (percentage < 70) return 'var(--color-success)';
    if (percentage < 100) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="skeleton" style="width: 120px; height: 120px; border-radius: 50%;"></div>
        <div class="skeleton" style="width: 80%; height: 24px; border-radius: 6px;"></div>
        <div class="skeleton" style="width: 60%; height: 18px; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const { consumed, goal } = data;
    const percentage = Math.min(100, Math.max(0, (consumed / goal) * 100));
    const remaining = goal - consumed;
    const color = this.getColor(percentage);

    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="circular-progress-container" style="position: relative;">
          ${renderCircularProgress({
            value: percentage,
            color: color,
            size: 140,
            strokeWidth: 10
          })}
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: 700;">${consumed}</span>
            <span style="font-size: 12px; color: var(--color-text-muted);">/ ${goal}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Calories</h3>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: var(--color-text-muted);">
            ${remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const container = this.container.querySelector('.circular-progress-container');
    if (container) {
      animateCircularProgress(container);
    }
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const nutritionResult = await nutritionRepository.getByDate(today);
    const settingsResult = await settingsRepository.getSettings();

    const consumed = nutritionResult.success && nutritionResult.data ? nutritionResult.data.totals.calories : 0;

    const goal = settingsResult.success && settingsResult.data?.caloriesGoal
      ? settingsResult.data.caloriesGoal
      : 2000;

    return { consumed, goal };
  }
}

