
/**
 * LocalStorage wrapper for SolidFit
 */

const STORAGE_PREFIX = 'solidfit_';

/**
 * Get item from localStorage
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage get error:', e);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 * @param {string} key
 * @param {any} value
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

/**
 * Remove item from localStorage
 * @param {string} key
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Storage remove error:', e);
  }
}

/**
 * Clear all SolidFit storage items
 */
export function clearStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Storage clear error:', e);
  }
}

