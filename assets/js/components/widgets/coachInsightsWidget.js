
/**
 * Coach Insights Widget
 */

import { BaseWidget } from './baseWidget.js';
import nutritionRepository from '../../repositories/nutritionRepository.js';
import workoutRepository from '../../repositories/workoutRepository.js';
import journalRepository from '../../repositories/journalRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import { toDateString } from '../../utils/date.js';

export class CoachInsightsWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-coach', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 120px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 90%; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const { recommendations } = data;

    if (recommendations.length === 0) {
      return `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Perfect!</h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-muted);">
            You're on track with all your goals!
          </p>
        </div>
      `;
    }

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
          🤖 Coach Insights
        </h3>
        <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px;">
          ${recommendations.map(rec => `
            <li style="
              padding: 12px;
              background-color: var(--color-card);
              border-radius: 8px;
              border-left: 4px solid var(--color-primary);
            ">
              ${rec}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const today = toDateString();
    const recommendations = [];

    // Get data
    const [nutritionRes, workoutRes, journalRes, settingsRes] = await Promise.all([
      nutritionRepository.getByDate(today),
      workoutRepository.getByDate(today),
      journalRepository.getByDate(today),
      settingsRepository.getSettings()
    ]);

    // Check protein
    const proteinGoal = settingsRes.success && settingsRes.data?.proteinGoal ? settingsRes.data.proteinGoal : 150;
    const proteinConsumed = nutritionRes.success && nutritionRes.data ? nutritionRes.data.totals.protein : 0;
    if (proteinConsumed < proteinGoal * 0.7) {
      recommendations.push('Increase protein intake today.');
    }

    // Check water
    const waterGoal = settingsRes.success && settingsRes.data?.waterGoal ? settingsRes.data.waterGoal : 2.5;
    const waterConsumed = settingsRes.success && settingsRes.data?.waterConsumed ? settingsRes.data.waterConsumed : 0;
    if (waterConsumed < waterGoal * 0.5) {
      recommendations.push('Drink more water.');
    }

    // Check workout
    if (workoutRes.success && workoutRes.data.length > 0 && !workoutRes.data[0].completed) {
      recommendations.push('Don\'t forget to complete your workout!');
    } else if (workoutRes.success && workoutRes.data.length > 0 && workoutRes.data[0].completed) {
      recommendations.push('Excellent consistency!');
    }

    // Check sleep (from settings)
    const sleepHours = settingsRes.success && settingsRes.data?.sleepHours ? settingsRes.data.sleepHours : 8;
    if (sleepHours < 6) {
      recommendations.push('Prioritize recovery tonight.');
    }

    return { recommendations };
  }
}

