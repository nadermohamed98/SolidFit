
/**
 * Theme management for SolidFit
 */

import { getStorage, setStorage } from './storage.js';

const THEME_KEY = 'theme';

export const themes = {
  DARK: 'dark',
  LIGHT: 'light'
};

/**
 * Initialize theme
 */
export function initTheme() {
  const savedTheme = getStorage(THEME_KEY);
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? themes.DARK : themes.LIGHT);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStorage(THEME_KEY)) {
      setTheme(e.matches ? themes.DARK : themes.LIGHT);
    }
  });
}

/**
 * Set theme
 * @param {string} theme
 */
export function setTheme(theme) {
  if (theme === themes.LIGHT) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  setStorage(THEME_KEY, theme);
}

/**
 * Toggle theme
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme();
  setTheme(currentTheme === themes.DARK ? themes.LIGHT : themes.DARK);
}

/**
 * Get current theme
 * @returns {string}
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? themes.LIGHT : themes.DARK;
}

