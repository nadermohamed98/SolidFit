
/**
 * Coach Page
 */

/**
 * Render coach page
 * @returns {HTMLElement}
 */
export function renderCoach() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Coach</h1>
      <p class="page-subtitle">Get AI-powered insights.</p>
    </div>

    <div class="card">
      <div class="card-body">
        <p>AI coaching coming soon...</p>
      </div>
    </div>
  `;

  return page;
}

