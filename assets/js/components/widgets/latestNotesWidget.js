
/**
 * Latest Notes Widget
 */

import { BaseWidget } from './baseWidget.js';
import journalRepository from '../../repositories/journalRepository.js';

export class LatestNotesWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-notes', ...options });
  }

  /**
   * Get skeleton HTML
   */
  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 120px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 16px; width: 80%; border-radius: 4px;"></div>
      </div>
    `;
  }

  /**
   * Get content HTML
   */
  getContentHTML(data) {
    if (!data.hasNotes) {
      return `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No Notes Yet</h3>
          <p style="margin: 0; font-size: 14px; color: var(--color-text-muted;">
            Write your first journal entry!
          </p>
        </div>
      `;
    }

    const latest = data.latest;

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
        Latest Note
      </h3>
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">
          ${latest.date}
        </div>
        ${latest.mood ? `<span style="font-size: 12px; padding: 2px 8px; border-radius: 10px; background: var(--color-card);">${latest.mood}</span>` : ''}
      </div>
      <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.6;">
        ${latest.content}
      </p>
    `;
  }

  /**
   * Load data
   */
  async loadData() {
    const result = await journalRepository.getAll();
    if (!result.success || result.data.length === 0) {
      return { hasNotes: false };
    }

    const sorted = [...result.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { hasNotes: true, latest: sorted[0] };
  }
}

