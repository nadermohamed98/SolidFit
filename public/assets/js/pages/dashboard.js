
/**
 * Dashboard Page
 */

import { WelcomeWidget } from '../components/widgets/welcomeWidget.js';
import { CaloriesWidget } from '../components/widgets/caloriesWidget.js';
import { ProteinWidget } from '../components/widgets/proteinWidget.js';
import { WaterWidget } from '../components/widgets/waterWidget.js';
import { WorkoutWidget } from '../components/widgets/workoutWidget.js';
import { RecoveryWidget } from '../components/widgets/recoveryWidget.js';
import { TodayMissionWidget } from '../components/widgets/todayMissionWidget.js';
import { CoachInsightsWidget } from '../components/widgets/coachInsightsWidget.js';
import { LatestNotesWidget } from '../components/widgets/latestNotesWidget.js';
import { WeeklyProgressWidget } from '../components/widgets/weeklyProgressWidget.js';
import { RecentActivityWidget } from '../components/widgets/recentActivityWidget.js';

const widgets = [];

/**
 * Render dashboard page
 * @returns {HTMLElement}
 */
export function renderDashboard() {
  // Clean up existing widgets
  widgets.forEach(w => w.destroy());
  widgets.length = 0;

  const page = document.createElement('div');
  page.className = 'page';
  page.style.padding = '24px';
  page.style.maxWidth = '1400px';
  page.style.margin = '0 auto';

  // Welcome widget (full width)
  const welcomeWidget = new WelcomeWidget();
  widgets.push(welcomeWidget);
  page.appendChild(welcomeWidget.render());

  // Quick stats grid
  const statsGrid = document.createElement('div');
  statsGrid.style.display = 'grid';
  statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(260px, 1fr))';
  statsGrid.style.gap = '16px';
  statsGrid.style.marginTop = '24px';

  [CaloriesWidget, ProteinWidget, WaterWidget, WorkoutWidget, RecoveryWidget].forEach(WidgetClass => {
    const widget = new WidgetClass();
    widgets.push(widget);
    statsGrid.appendChild(widget.render());
  });
  page.appendChild(statsGrid);

  // Middle section grid
  const middleGrid = document.createElement('div');
  middleGrid.style.display = 'grid';
  middleGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
  middleGrid.style.gap = '16px';
  middleGrid.style.marginTop = '24px';

  [TodayMissionWidget, CoachInsightsWidget, LatestNotesWidget].forEach(WidgetClass => {
    const widget = new WidgetClass();
    widgets.push(widget);
    middleGrid.appendChild(widget.render());
  });
  page.appendChild(middleGrid);

  // Bottom section grid
  const bottomGrid = document.createElement('div');
  bottomGrid.style.display = 'grid';
  bottomGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
  bottomGrid.style.gap = '16px';
  bottomGrid.style.marginTop = '24px';

  [WeeklyProgressWidget, RecentActivityWidget].forEach(WidgetClass => {
    const widget = new WidgetClass();
    widgets.push(widget);
    bottomGrid.appendChild(widget.render());
  });
  page.appendChild(bottomGrid);

  return page;
}

