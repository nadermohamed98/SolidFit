
/**
 * Recent Activity Widget
 */

import { BaseWidget } from './baseWidget.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import workoutRepository from '../../repositories/workoutRepository.js';
import journalRepository from '../../repositories/journalRepository.js';
import { toDateString } from '../../utils/date.js';

export class RecentActivityWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-activity', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 140px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 48px; width: 100%; margin-bottom: 8px; border-radius: 8px;"></div>
        <div class="skeleton" style="height: 48px; width: 100%; margin-bottom: 8px; border-radius: 8px;"></div>
        <div class="skeleton" style="height: 48px; width: 100%; border-radius: 8px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    if (data.activities.length === 0) {
      return `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">📅</div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No Activity Yet</h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-muted);">
            Start tracking your workouts and meals!
          </p>
        </div>
      `;
    }

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
          Recent Activity
        </h3>
        <div style="position: relative; padding-left: 24px;">
          <!-- Timeline line -->
          <div style="position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background-color: var(--color-border);"></div>
          
          ${data.activities.map(activity => `
            <div style="position: relative; margin-bottom: 16px;">
              <div style="position: absolute; left: -20px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: var(--color-primary);"></div>
              <div style="padding: 8px 0;">
                <div style="font-weight: 600; margin-bottom: 2px;">${activity.title}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">${activity.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const [nutritionRes, workoutRes, journalRes] = await Promise.all([
      nutritionRepository.getByDate(today),
      workoutRepository.getByDate(today),
      journalRepository.getByDate(today)
    ]);

    const activities = [];

    // Add workouts
    if (workoutRes.success) {
      workoutRes.data.forEach(w => {
        activities.push({
          title: w.name || 'Workout',
          description: `${w.type || 'General'} • ${w.duration || 0} min`,
          time: new Date(w.createdAt)
        });
      });
    }

    // Add nutrition
    if (nutritionRes.success && nutritionRes.data) {
      nutritionRes.data.meals.forEach(n => {
        activities.push({
          title: n.mealName || 'Meal',
          description: `${n.calories} cal • ${n.protein.toFixed(1)}g protein`,
          time: new Date(n.createdAt)
        });
      });
    }

    // Add journal
    if (journalRes.success) {
      journalRes.data.forEach(j => {
        activities.push({
          title: 'Journal Entry',
          description: j.mood || 'Mood logged',
          time: new Date(j.createdAt)
        });
      });
    }

    // Sort by time (newest first)
    activities.sort((a, b) => b.time - a.time);

    return { activities: activities.slice(0, 5) };
  }
}

