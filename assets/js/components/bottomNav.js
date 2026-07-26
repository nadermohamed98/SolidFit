
/**
 * Bottom Navigation Component (Mobile)
 */

import { navItems } from '../navigation.js';
import { navigate, getCurrentRoute } from '../router.js';
import { getIcon } from './sidebar.js';

let bottomNavEl = null;

// Use only main items for bottom nav
const bottomNavItems = navItems.filter(item => 
  ['dashboard', 'nutrition', 'workout', 'progress', 'journal'].includes(item.id)
);

/**
 * Render bottom navigation
 * @returns {HTMLElement}
 */
export function renderBottomNav() {
  bottomNavEl = document.createElement('nav');
  bottomNavEl.className = 'bottom-nav';

  bottomNavEl.innerHTML = `
    <div class="bottom-nav-items">
      ${bottomNavItems.map(item => `
        <div class="bottom-nav-item" data-path="${item.path}" data-id="${item.id}">
          <span class="bottom-nav-item-icon">${getIcon(item.icon)}</span>
          <span class="bottom-nav-item-label">${item.label}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Add event listeners
  bottomNavEl.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.path);
    });
  });

  updateActiveNav();

  return bottomNavEl;
}

/**
 * Update active nav item
 */
export function updateActiveNav() {
  const currentPath = getCurrentRoute();
  if (!bottomNavEl) return;

  bottomNavEl.querySelectorAll('.bottom-nav-item').forEach(item => {
    if (item.dataset.path === currentPath) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

