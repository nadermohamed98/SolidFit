
/**
 * Router for SolidFit
 */

let routes = {};
let currentRoute = '';
let onRouteChange = null;

/**
 * Initialize router
 * @param {object} routeConfig
 * @param {Function} callback
 */
export function initRouter(routeConfig, callback) {
  routes = routeConfig;
  onRouteChange = callback;

  window.addEventListener('popstate', () => {
    handleRoute();
  });

  handleRoute();
}

/**
 * Handle route change
 */
function handleRoute() {
  const path = window.location.hash.slice(1) || '/';
  currentRoute = path;
  if (onRouteChange) {
    onRouteChange(path);
  }
}

/**
 * Navigate to route
 * @param {string} path
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Get current route
 * @returns {string}
 */
export function getCurrentRoute() {
  return currentRoute;
}

