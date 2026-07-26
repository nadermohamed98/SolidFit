
/**
 * Workout Page
 */

import { WorkoutTemplatesWidget } from '../components/widgets/workoutTemplatesWidget.js';
import { WorkoutHistoryWidget } from '../components/widgets/workoutHistoryWidget.js';
import { WorkoutSession } from '../components/workoutSession.js';
import workoutRepository from '../repositories/workoutRepository.js';
import workoutTemplateRepository from '../repositories/workoutTemplateRepository.js';
import { toDateString } from '../utils/date.js';
import { showModal, hideModal } from '../components/modal.js';

let activeWidgets = [];
let activeSession = null;
let mainContentContainer = null;
let dataChangedListener = null;

/**
 * Render Workout Page
 * @returns {HTMLElement}
 */
export function renderWorkout() {
  // Clean up previous
  activeWidgets.forEach(w => w.destroy && w.destroy());
  activeWidgets.length = 0;
  if (activeSession) {
    activeSession.destroy();
    activeSession = null;
  }

  const page = document.createElement('div');
  page.className = 'page';
  mainContentContainer = page;

  if (dataChangedListener) {
    window.removeEventListener('solidfit:data-changed', dataChangedListener);
  }
  dataChangedListener = () => {
    if (mainContentContainer && !activeSession) {
      renderMainContent(mainContentContainer);
    }
  };
  window.addEventListener('solidfit:data-changed', dataChangedListener);

  page.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
      <div>
        <h1 class="page-title">Workout</h1>
        <p class="page-subtitle">Track full training sessions with templates, live sets, and recovery feedback.</p>
      </div>
      <button class="btn btn-primary" id="page-start-workout-btn" aria-label="Start a new workout">Start Workout</button>
    </div>
  `;
  page.querySelector('#page-start-workout-btn').addEventListener('click', () => showTemplateSelector());

  const content = document.createElement('div');
  page.appendChild(content);
  mainContentContainer = content;

  renderMainContent(content);

  return page;
}

function renderMainContent(container) {
  activeWidgets.forEach(widget => widget.destroy && widget.destroy());
  activeWidgets.length = 0;
  container.innerHTML = '';

  // Today's Workout Widget
  const todayWidget = new (class TodayWorkoutWidget {
    constructor() {
      this.container = document.createElement('div');
    }
    async render() {
      const todayResult = await workoutRepository.getByDate(toDateString());
      const todayWorkouts = todayResult.success ? [...todayResult.data] : [];
      todayWorkouts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      const activeWorkout = todayWorkouts.find(workout => !workout.completed);
      const displayWorkout = activeWorkout || todayWorkouts[0] || null;
      const hasWorkoutToday = todayWorkouts.length > 0;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '24px';
      card.style.margin = '0 0 16px 0';

      if (hasWorkoutToday) {
        const workout = displayWorkout;
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 18px;">Today's Workout</h3>
              <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">
                ${workout.name} • ${workout.duration} min
              </p>
            </div>
            ${workout.completed ? '<span style="font-size: 24px;">✅</span>' : '<button class="btn btn-primary" id="resume-workout-btn">Resume Workout</button>'}
          </div>
        `;

        const resumeBtn = card.querySelector('#resume-workout-btn');
        if (resumeBtn) {
          resumeBtn.addEventListener('click', () => {
            startSession(null, workout);
          });
        }
      } else {
        card.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">💪</div>
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">No workout planned.</h3>
            <p style="margin: 0 0 16px 0; color: var(--color-text-muted); font-size: 14px;">Ready to start a new workout?</p>
            <button class="btn btn-primary" id="start-workout-btn" aria-label="Start workout">Start Workout</button>
          </div>
        `;

        const startBtn = card.querySelector('#start-workout-btn');
        startBtn.addEventListener('click', () => showTemplateSelector());
      }

      this.container.appendChild(card);
      return this.container;
    }
  })();

  const templatesWidget = new WorkoutTemplatesWidget({
    onTemplateSelect: async (template) => {
      hideModal();
      await startSession(template);
    }
  });
  const historyWidget = new WorkoutHistoryWidget();

  activeWidgets.push(templatesWidget, historyWidget);

  (async () => {
    container.appendChild(await todayWidget.render());
    container.appendChild(templatesWidget.render());
    container.appendChild(historyWidget.render());
  })();
}

async function showTemplateSelector() {
  const result = await workoutTemplateRepository.getAll();
  const templates = result.success ? result.data : [];

  const modalContent = document.createElement('div');
  modalContent.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <h3 style="margin: 0; font-size: 18px;">Select a Template</h3>
      ${templates.length === 0 ? `
        <div style="text-align: center; padding: 24px; color: var(--color-text-muted);">
          No templates yet! Create one first.
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
          ${templates.map(t => `
            <button class="card" style="padding: 16px; text-align: left; border: none; background: var(--color-card-hover); cursor: pointer;" data-select-template-id="${t.id}">
              <div style="font-weight: 600;">${t.name}</div>
              <div style="font-size: 13px; color: var(--color-text-muted);">${t.category} • ${t.exercises.length} exercises</div>
            </button>
          `).join('')}
        </div>
      `}
    </div>
  `;

  showModal({
    title: 'Start Workout',
    content: modalContent,
    actions: [
      { id: 'cancel', label: 'Cancel', className: 'btn', onClick: hideModal }
    ]
  });

  requestAnimationFrame(() => {
    modalContent.querySelectorAll('[data-select-template-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const templateId = btn.dataset.selectTemplateId;
        const templateResult = await workoutTemplateRepository.getById(templateId);
        if (templateResult.success) {
          hideModal();
          await startSession(templateResult.data);
        }
      });
    });
  });
}

async function startSession(template, existingWorkout = null) {
  const result = existingWorkout
    ? { success: true, data: existingWorkout }
    : await workoutRepository.createFromTemplate(template);
  if (!result.success) {
    alert(result.error);
    return;
  }
  if (activeSession) {
    activeSession.destroy();
  }

  activeSession = new WorkoutSession({
    workout: result.data,
    onFinish: () => {
      // Go back to main workout page
      if (mainContentContainer) {
        activeSession.destroy();
        activeSession = null;
        renderMainContent(mainContentContainer);
      }
    }
  });

  if (mainContentContainer) {
    mainContentContainer.innerHTML = '';
    mainContentContainer.appendChild(activeSession.render());
  }
}
