
/**
 * Progress Ring Component
 */

/**
 * Render progress ring
 * @param {object} props
 * @param {number} props.value
 * @param {number} props.max
 * @param {string} props.label
 * @returns {HTMLElement}
 */
export function renderProgressRing({ value = 0, max = 100, label = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * 52; // 2 * PI * radius (60 - 8)
  const offset = circumference - (percentage / 100) * circumference;

  const ring = document.createElement('div');
  ring.className = 'progress-ring';

  ring.innerHTML = `
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle class="progress-ring-bg" cx="60" cy="60" r="52"></circle>
      <circle 
        class="progress-ring-fill" 
        cx="60" 
        cy="60" 
        r="52"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference}"
      ></circle>
    </svg>
    <div class="progress-ring-text">
      <span class="progress-ring-value">${Math.round(percentage)}%</span>
      ${label ? `<span class="progress-ring-label">${label}</span>` : ''}
    </div>
  `;

  // Animate after rendering
  requestAnimationFrame(() => {
    const fill = ring.querySelector('.progress-ring-fill');
    if (fill) {
      fill.style.strokeDashoffset = offset;
    }
  });

  return ring;
}

