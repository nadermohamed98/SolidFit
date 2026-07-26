
/**
 * Nutrition Page
 */

import { NutritionSummaryWidget } from '../components/widgets/nutritionSummaryWidget.js';
import { MealsTimelineWidget } from '../components/widgets/mealsTimelineWidget.js';
import { showMealModal } from '../components/mealModal.js';
import { getIcon } from '../components/sidebar.js';

const widgets = [];

/**
 * Render Nutrition Page
 * @returns {HTMLElement}
 */
export function renderNutrition() {
  // Clean up existing widgets
  widgets.forEach(w => w.destroy && w.destroy());
  widgets.length = 0;

  const page = document.createElement('div');
  page.className = 'page';
  page.style.paddingBottom = '100px'; // Space for FAB on mobile

  // Add widgets
  const summaryWidget = new NutritionSummaryWidget();
  widgets.push(summaryWidget);
  page.appendChild(summaryWidget.render());

  const timelineWidget = new MealsTimelineWidget();
  widgets.push(timelineWidget);
  page.appendChild(timelineWidget.render());

  // Add Floating Action Button
  const fab = document.createElement('button');
  fab.className = 'fab';
  fab.setAttribute('aria-label', 'Add Meal');
  fab.innerHTML = getIcon('plus');
  fab.style.position = 'fixed';
  fab.style.bottom = '80px';
  fab.style.right = '24px';
  fab.addEventListener('click', () => {
    showMealModal();
  });
  page.appendChild(fab);

  return page;
}

