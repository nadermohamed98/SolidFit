
/**
 * Today's Mission Widget
 */

import { BaseWidget } from './baseWidget.js';
import workoutRepository from '../../repositories/workoutRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class TodayMissionWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-today-mission', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 140px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 80%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 70%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 60%; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const { hasWorkout, workout, goals } = data;

    if (!hasWorkout) {
      return `
        <div style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
            Today's Mission
          </h3>
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">😴</div>
            <h4 style="margin: 0 0 8px 0;">Recovery Day</h4>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">
              Focus on stretching and mobility.
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
          Today's Mission
        </h3>
        <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px;">
          <li style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">1</span>
            <span>Complete ${workout.name || 'workout'}</span>
          </li>
          <li style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-secondary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">2</span>
            <span>Hit ${goals.protein}g protein</span>
          </li>
          <li style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">3</span>
            <span>Drink ${goals.water}L water</span>
          </li>
          <li style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-success); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">4</span>
            <span>Sleep ${goals.sleep} hours</span>
          </li>
        </ul>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const workoutRes = await workoutRepository.getByDate(today);
    const settingsRes = await settingsRepository.getSettings();

    const hasWorkout = workoutRes.success && workoutRes.data.length > 0;

    const goals = {
      protein: settingsRes.success && settingsRes.data?.proteinGoal ? settingsRes.data.proteinGoal : 150,
      water: settingsRes.success && settingsRes.data?.waterGoal ? settingsRes.data.waterGoal : 2.5,
      sleep: settingsRes.success && settingsRes.data?.sleepGoal ? settingsRes.data.sleepGoal : 8
    };

    return {
      hasWorkout,
      workout: hasWorkout ? workoutRes.data[0] : null,
      goals
    };
  }
}

