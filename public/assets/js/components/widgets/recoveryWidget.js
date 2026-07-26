
/**
 * Recovery Widget
 */

import { BaseWidget } from './baseWidget.js';
import { renderCircularProgress, animateCircularProgress } from '../circularProgress.js';
import journalRepository from '../../repositories/journalRepository.js';
import settingsRepository from '../../repositories/settingsRepository.js';
import checkInRepository from '../../repositories/checkInRepository.js';
import CheckInModel from '../../models/checkInModel.js';
import { toDateString } from '../../utils/date.js';

export class RecoveryWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-recovery', ...options });
  }

  /**
   * Get recovery score and label
   */
  calculateRecovery(data) {
    let score = 50;

    // Sleep (0-30 points)
    const sleep = data.sleepHours || 7;
    if (sleep >= 8) score += 30;
    else if (sleep >= 7) score += 20;
    else if (sleep >= 6) score += 10;

    // Pain level (0-20 points)
    const pain = data.painLevel || 3;
    if (pain <= 2) score += 20;
    else if (pain <= 4) score += 10;
    else if (pain <= 6) score -= 10;
    else score -= 20;

    // Mood (0-20 points)
    const mood = data.mood || '';
    if (['great', 'excellent', 'good'].includes(mood.toLowerCase())) score += 20;
    else if (['okay', 'fine', 'average'].includes(mood.toLowerCase())) score += 10;
    else if (['bad', 'poor', 'terrible'].includes(mood.toLowerCase())) score -= 10;

    score = Math.max(0, Math.min(100, score));

    let label;
    let color;
    if (score >= 80) { label = 'Excellent'; color = 'var(--color-success)'; }
    else if (score >= 60) { label = 'Good'; color = 'var(--color-primary)'; }
    else if (score >= 40) { label = 'Average'; color = 'var(--color-warning)'; }
    else { label = 'Poor'; color = 'var(--color-danger)'; }

    return { score, label, color };
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="skeleton" style="width: 120px; height: 120px; border-radius: 50%;"></div>
        <div class="skeleton" style="width: 80px; height: 24px; border-radius: 6px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const { score, label, color } = this.calculateRecovery(data);

    return `
      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="circular-progress-container" style="position: relative;">
          ${renderCircularProgress({
            value: score,
            color: color,
            size: 140,
            strokeWidth: 10
          })}
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: 700;">${score}%</span>
          </div>
        </div>
        <div style="text-align: center;">
          <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: ${color};">
            ${label}
          </h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-muted);">
            Recovery Score
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
    const checkInRes = await checkInRepository.getByDate(today);

    if (checkInRes.success && checkInRes.data) {
      return {
        sleepHours: checkInRes.data.sleepHours,
        painLevel: CheckInModel.getDerivedPainLevel(checkInRes.data),
        mood: CheckInModel.getDerivedMood(checkInRes.data)
      };
    }

    const journalRes = await journalRepository.getByDate(today);
    const settingsRes = await settingsRepository.getSettings();

    let mood = '';
    if (journalRes.success && journalRes.data.length > 0) {
      mood = journalRes.data[0].mood || '';
    }

    const sleepHours = settingsRes.success && settingsRes.data?.sleepHours
      ? settingsRes.data.sleepHours
      : 7;
    const painLevel = settingsRes.success && settingsRes.data?.painLevel
      ? settingsRes.data.painLevel
      : 3;

    return { sleepHours, painLevel, mood };
  }
}
