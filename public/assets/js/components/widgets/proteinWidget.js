
/**
 * Protein Widget
 */

import { BaseWidget } from './baseWidget.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class ProteinWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-protein', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 80px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 60%; border-radius: 4px;"></div>
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

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Protein</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 24px; font-weight: 700;">${consumed}g</span>
          <span style="font-size: 14px; color: var(--color-text-muted);">/ ${goal}g</span>
        </div>
        <div style="width: 100%; height: 12px; background-color: var(--color-card); border-radius: 6px; overflow: hidden;">
          <div class="progress-bar"
               style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); border-radius: 6px; transition: width 1s ease-out;"
               data-width="${percentage}">
          </div>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: var(--color-text-muted);">
          ${remaining > 0 ? `${remaining}g remaining` : `${Math.abs(remaining)}g over`}
        </p>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const progressBar = this.container.querySelector('.progress-bar');
    if (progressBar) {
      requestAnimationFrame(() => {
        const width = progressBar.getAttribute('data-width');
        if (width) {
          progressBar.style.width = `${width}%`;
        }
      });
    }
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const nutritionResult = await nutritionRepository.getByDate(today);
    const settingsResult = await settingsRepository.getSettings();

    const consumed = nutritionResult.success && nutritionResult.data ? nutritionResult.data.totals.protein : 0;

    const goal = settingsResult.success && settingsResult.data?.proteinGoal
      ? settingsResult.data.proteinGoal
      : 150;

    return { consumed, goal };
  }
}

