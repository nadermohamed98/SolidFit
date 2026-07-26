
/**
 * Workout Widget
 */

import { BaseWidget } from './baseWidget.js';
import workoutRepository from '../../repositories/workoutRepository.js';
import { toDateString } from '../../utils/date.js';

export class WorkoutWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-workout', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 120px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 60%; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    if (!data.hasWorkout) {
      return `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🏖️</div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Rest Day</h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-muted);">
            Your body needs time to recover.
          </p>
        </div>
      `;
    }

    const statusClass = data.completed
      ? 'status-completed'
      : 'status-pending';

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
          Today's Workout
        </h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">${data.name}</span>
            <span style="
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background-color: ${data.completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
              color: ${data.completed ? 'var(--color-success)' : 'var(--color-warning)'};
            ">
              ${data.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div style="display: flex; gap: 24px; color: var(--color-text-muted); font-size: 14px;">
            <span>💪 ${data.type || 'General'}</span>
            <span>⏱️ ${data.duration || 0} min</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const result = await workoutRepository.getByDate(today);

    if (!result.success || result.data.length === 0) {
      return { hasWorkout: false };
    }

    const workout = result.data[0];
    return {
      hasWorkout: true,
      name: workout.name || 'Workout',
      type: workout.type,
      duration: workout.duration,
      completed: workout.completed || false
    };
  }
}

