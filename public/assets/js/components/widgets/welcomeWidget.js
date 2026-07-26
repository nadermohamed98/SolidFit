
/**
 * Welcome Widget
 */

import { BaseWidget } from './baseWidget.js';
import profileRepository from '../../repositories/profileRepository.js';
import { toDateString } from '../../utils/date.js';

export class WelcomeWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-welcome', ...options });
  }

  /**
   * Get greeting based on time of day
   * @returns {string}
   */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  /**
   * Get motivational quote
   * @returns {string}
   */
  getQuote() {
    const quotes = [
      'Progress, not perfection.',
      'Every rep counts.',
      'You are stronger than you think.',
      'Consistency is key.',
      'Make today count.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 32px; width: 60%; margin-bottom: 12px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 20px; width: 40%; margin-bottom: 16px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 18px; width: 80%; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    const name = data?.name || 'Athlete';
    const greeting = this.getGreeting();
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const quote = this.getQuote();

    return `
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
          ${greeting}, ${name}
        </h2>
        <p style="margin: 0 0 16px 0; color: var(--color-text-muted); font-size: 14px;">
          ${dateFormatted}
        </p>
        <p style="margin: 0; font-style: italic; color: var(--color-primary);">
          "${quote}"
        </p>
      </div>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const result = await profileRepository.getProfile();
    return result.success ? result.data : null;
  }
}

