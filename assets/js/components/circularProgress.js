
/**
 * Circular Progress Component
 */

/**
 * Render circular progress
 * @param {object} options
 * @param {number} options.value - Current value (0-100)
 * @param {number} options.size - SVG size in pixels
 * @param {number} options.strokeWidth - Stroke width
 * @param {string} options.color - Progress color
 * @returns {string} - HTML string
 */
export function renderCircularProgress(options = {}) {
  const {
    value = 0,
    size = 120,
    strokeWidth = 8,
    color = 'var(--color-primary)'
  } = options;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="var(--color-card)"
        stroke-width="${strokeWidth}"
      />
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="none"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference}"
        style="transition: stroke-dashoffset 1s ease-out;"
        class="progress-circle"
        data-offset="${offset}"
      />
    </svg>
  `;
}

/**
 * Animate circular progress
 * @param {HTMLElement} container - Container element containing the SVG
 */
export function animateCircularProgress(container) {
  const circle = container.querySelector('.progress-circle');
  if (circle) {
    requestAnimationFrame(() => {
      const offset = circle.getAttribute('data-offset');
      if (offset) {
        circle.style.strokeDashoffset = offset;
      }
    });
  }
}

