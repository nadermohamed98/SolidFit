
/**
 * Navbar Component
 */

import { toggleTheme, getCurrentTheme } from '../theme.js';
import { toggleMobileSidebar } from './sidebar.js';
import { getIcon } from './sidebar.js';

/**
 * Render navbar
 * @returns {HTMLElement}
 */
export function renderNavbar() {
  const navbar = document.createElement('header');
  navbar.className = 'navbar';

  navbar.innerHTML = `
    <div class="navbar-left">
      <button class="btn btn-ghost btn-icon mobile-menu-btn" title="Menu">
        ${getIcon('menu')}
      </button>
    </div>
    <div class="navbar-right">
      <button class="btn btn-ghost btn-icon theme-toggle" title="Toggle Theme">
        <span class="theme-icon">${getCurrentTheme() === 'light' ? getIcon('sun') : getIcon('moon')}</span>
      </button>
    </div>
  `;

  // Mobile menu button
  const mobileMenuBtn = navbar.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
  }

  // Theme toggle
  const themeToggle = navbar.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
      const themeIcon = themeToggle.querySelector('.theme-icon');
      if (themeIcon) {
        themeIcon.innerHTML = getCurrentTheme() === 'light' ? getIcon('sun') : getIcon('moon');
      }
    });
  }

  return navbar;
}

