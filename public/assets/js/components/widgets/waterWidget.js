
/**
 * Water Widget
 */

import { BaseWidget } from './baseWidget.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class WaterWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-water', ...options });
    this.currentAmount = 0;
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="skeleton" style="width: 100px; height: 160px; border-radius: 16px;"></div>
        <div class="skeleton" style="width: 80%; height: 24px; border-radius: 6px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const { consumed, goal } = data;
    const percentage = Math.min(100, Math.max(0, (consumed / goal) * 100));

    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div style="
          width: 100px;
          height: 160px;
          background-color: var(--color-card);
          border-radius: 16px;
          border: 2px solid var(--color-border);
          overflow: hidden;
          position: relative;
        ">
          <div class="water-fill"
               style="
                 position: absolute;
                 bottom: 0;
                 left: 0;
                 right: 0;
                 background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
                 height: 0%;
                 transition: height 1s ease-out;
               "
               data-height="${percentage}">
          </div>
          <div style="
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-primary);
            font-weight: 700;
            font-size: 20px;
          ">
            ${consumed}L
          </div>
        </div>
        <div style="text-align: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Water</h3>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: var(--color-text-muted);">
            Goal: ${goal}L
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const waterFill = this.container.querySelector('.water-fill');
    if (waterFill) {
      requestAnimationFrame(() => {
        const height = waterFill.getAttribute('data-height');
        if (height) {
          waterFill.style.height = `${height}%`;
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

    const consumed = nutritionResult.success && nutritionResult.data ? nutritionResult.data.totals.water : 0;
    const goal = settingsResult.success && settingsResult.data?.waterGoal
      ? settingsResult.data.waterGoal
      : 2.5;

    return { consumed, goal };
  }
}

