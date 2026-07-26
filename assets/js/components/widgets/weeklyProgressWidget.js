
/**
 * Weekly Progress Widget
 */

import { BaseWidget } from './baseWidget.js';
import progressRepository from '../../repositories/progressRepository.js';

export class WeeklyProgressWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-weekly', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 160px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
          <div class="skeleton" style="height: 80px; border-radius: 8px;"></div>
        </div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
          Weekly Progress
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div style="padding: 12px; background: var(--color-card); border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700;">${data.weight || '--'}</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">Weight (kg)</div>
            <div style="font-size: 12px; color: ${data.weightChange >= 0 ? 'var(--color-danger)' : 'var(--color-success)'};">
              ${data.weightChange > 0 ? '+' : ''}${data.weightChange || 0} kg
            </div>
          </div>
          <div style="padding: 12px; background: var(--color-card); border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700;">${data.bodyFat || '--'}</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">Body Fat %</div>
          </div>
          <div style="padding: 12px; background: var(--color-card); border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700;">${data.muscle || '--'}</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">Muscle (kg)</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const result = await progressRepository.getAll();

    if (!result.success || result.data.length === 0) {
      return {
        weight: null,
        weightChange: 0,
        bodyFat: null,
        muscle: null
      };
    }

    const sorted = [...result.data].sort((a, b) => new Date(b.date) - new Date(a.date));
    const current = sorted[0];
    const previous = sorted[1];

    const weightChange = previous && current.weight && previous.weight
      ? (current.weight - previous.weight).toFixed(1)
      : 0;

    return {
      weight: current.weight?.toFixed(1) || '--',
      weightChange: parseFloat(weightChange),
      bodyFat: current.bodyFat?.toFixed(1) || '--',
      muscle: current.muscle?.toFixed(1) || '--'
    };
  }
}

