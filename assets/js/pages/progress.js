
/**
 * Progress Page
 */

/**
 * Render progress page
 * @returns {HTMLElement}
 */
export function renderProgress() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Progress</h1>
      <p class="page-subtitle">See how far you've come.</p>
    </div>

    <div class="card" style="padding: 32px; text-align: center;">
      <div style="font-size: 56px; margin-bottom: 12px;">📈</div>
      <h2 style="margin: 0 0 6px 0; font-size: 20px;">No progress entries yet.</h2>
      <p style="margin: 0; color: var(--color-text-muted);">Your measurements and milestones will show up here once you start tracking them.</p>
    </div>
  `;

  return page;
}
