
/**
 * SolidFit App Main Entry
 */

import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { renderSidebar, updateActiveNav } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import { renderBottomNav, updateActiveNav as updateBottomNav } from './components/bottomNav.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNutrition } from './pages/nutrition.js';
import { renderFoodPreferences } from './pages/foodPreferences.js';
import { renderNutritionGoals } from './pages/nutritionGoals.js';
import { renderMealGenerator } from './pages/mealGenerator.js';
import { renderWorkout } from './pages/workout.js';
import { renderProgress } from './pages/progress.js';
import { renderJournal } from './pages/journal.js';
import { renderCoach } from './pages/coach.js';
import { renderSettings } from './pages/settings.js';
import { renderDevTestPage } from './pages/devTestPage.js';
import { getIcon } from './components/sidebar.js';

// Page renderers
const pageRenderers = {
  '/': renderDashboard,
  '/nutrition': renderNutrition,
  '/nutrition-goals': renderNutritionGoals,
  '/food-preferences': renderFoodPreferences,
  '/meal-generator': renderMealGenerator,
  '/workout': renderWorkout,
  '/progress': renderProgress,
  '/journal': renderJournal,
  '/coach': renderCoach,
  '/settings': renderSettings,
  '/dev': renderDevTestPage
};

let mainContent = null;

/**
 * Initialize app
 */
function initApp() {
  // Initialize theme
  initTheme();

  // Build app structure
  const app = document.getElementById('app');
  if (!app) return;

  // Render sidebar
  app.appendChild(renderSidebar());

  // Main wrapper
  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'main-wrapper';

  // Navbar
  mainWrapper.appendChild(renderNavbar());

  // Page content container
  mainContent = document.createElement('main');
  mainContent.className = 'page-content';
  mainWrapper.appendChild(mainContent);

  app.appendChild(mainWrapper);

  // Bottom nav
  app.appendChild(renderBottomNav());

  // Floating action button
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.innerHTML = getIcon('plus');
  fab.setAttribute('aria-label', 'Quick Add');
  app.appendChild(fab);

  // Initialize router
  initRouter(pageRenderers, handleRouteChange);
}

/**
 * Handle route change
 * @param {string} path
 */
function handleRouteChange(path) {
  if (!mainContent) return;

  // Get renderer
  const renderer = pageRenderers[path] || pageRenderers['/'];

  // Clear and render new page
  mainContent.innerHTML = '';
  mainContent.appendChild(renderer());

  // Update nav items
  updateActiveNav();
  updateBottomNav();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
