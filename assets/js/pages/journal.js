/**
 * Recovery / Daily Check-In Page
 */

import checkInRepository from '../repositories/checkInRepository.js';
import { CheckInForm } from '../components/checkInForm.js';
import { showCheckInHistoryModal } from '../components/checkInHistoryModal.js';
import { toDateString } from '../utils/date.js';

function getStatusLabel(value, type = 'boolean') {
  if (type === 'workout') {
    if (value === 'rest') return 'Rest Day';
    return value === 'yes' ? 'Yes' : 'No';
  }

  return value ? 'Yes' : 'No';
}

function calculateReadiness(checkIn) {
  const positiveStress = 6 - checkIn.stressLevel;
  const average = (
    checkIn.sleepQuality +
    checkIn.energyLevel +
    checkIn.motivation +
    positiveStress
  ) / 4;

  return Math.round((average / 5) * 100);
}

function createEmptyState() {
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  wrapper.style.padding = '24px';
  wrapper.innerHTML = `
    <div style="text-align: center; padding: 12px 0;">
      <div style="font-size: 56px; margin-bottom: 12px;">🌤️</div>
      <h3 style="margin: 0 0 6px 0; font-size: 20px;">No check-in yet today</h3>
      <p style="margin: 0; color: var(--color-text-muted);">Complete your daily check-in in under a minute.</p>
    </div>
  `;
  return wrapper;
}

function createTodaySummary(checkIn) {
  const readiness = calculateReadiness(checkIn);
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  wrapper.style.padding = '20px';
  wrapper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
      <div>
        <h3 style="margin: 0 0 6px 0; font-size: 20px;">Today's Check-In</h3>
        <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Saved for ${new Date(checkIn.date).toLocaleDateString()}</p>
      </div>
      <div style="padding: 10px 14px; border-radius: 9999px; background: rgba(99, 102, 241, 0.12); color: var(--color-primary); font-weight: 700; font-size: 14px;">
        ${readiness}% Ready
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
      <div style="padding: 14px; border-radius: 14px; background: var(--color-card);">
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Sleep</div>
        <div style="font-size: 20px; font-weight: 700;">${checkIn.sleepHours}h</div>
        <div style="font-size: 12px; color: var(--color-text-muted);">Quality ${checkIn.sleepQuality}/5</div>
      </div>
      <div style="padding: 14px; border-radius: 14px; background: var(--color-card);">
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Energy</div>
        <div style="font-size: 20px; font-weight: 700;">${checkIn.energyLevel}/5</div>
        <div style="font-size: 12px; color: var(--color-text-muted);">Motivation ${checkIn.motivation}/5</div>
      </div>
      <div style="padding: 14px; border-radius: 14px; background: var(--color-card);">
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Pain</div>
        <div style="font-size: 20px; font-weight: 700;">${Math.max(checkIn.shoulderPain, checkIn.kneePain)}/10</div>
        <div style="font-size: 12px; color: var(--color-text-muted);">Shoulder ${checkIn.shoulderPain} • Knee ${checkIn.kneePain}</div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-top: 16px;">
      <div style="padding: 12px 14px; border-radius: 12px; background: var(--color-card); font-size: 14px;">Nutrition: <strong>${getStatusLabel(checkIn.followedNutrition)}</strong></div>
      <div style="padding: 12px 14px; border-radius: 12px; background: var(--color-card); font-size: 14px;">Workout: <strong>${getStatusLabel(checkIn.completedWorkout, 'workout')}</strong></div>
      <div style="padding: 12px 14px; border-radius: 12px; background: var(--color-card); font-size: 14px;">Water Goal: <strong>${getStatusLabel(checkIn.waterGoalReached)}</strong></div>
    </div>
    ${checkIn.otherPain ? `<div style="margin-top: 16px; font-size: 14px; color: var(--color-text-secondary);"><strong>Other pain:</strong> ${checkIn.otherPain}</div>` : ''}
    ${checkIn.notes ? `<div style="margin-top: 12px; font-size: 14px; color: var(--color-text-secondary);"><strong>Notes:</strong> ${checkIn.notes}</div>` : ''}
  `;
  return wrapper;
}

/**
 * Render journal page
 * @returns {HTMLElement}
 */
export function renderJournal() {
  const page = document.createElement('div');
  page.className = 'page';

  let currentCheckIn = null;
  let isEditing = false;
  let formComponent = null;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Recovery / Daily Check-In</h1>
      <p class="page-subtitle">A quick daily pulse check you can finish in under a minute.</p>
    </div>
  `;

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '16px';
  page.appendChild(content);

  async function loadCheckIn() {
    const result = await checkInRepository.getByDate(toDateString());
    currentCheckIn = result.success ? result.data : null;
  }

  async function showHistory() {
    const historyResult = await checkInRepository.getAllCheckIns();
    showCheckInHistoryModal(historyResult.success ? historyResult.data : []);
  }

  async function saveCurrentCheckIn() {
    if (!formComponent) return;

    const payload = {
      ...formComponent.getValue(),
      id: currentCheckIn?.id,
      date: currentCheckIn?.date || toDateString(),
      createdAt: currentCheckIn?.createdAt
    };

    const result = await checkInRepository.save(payload);
    if (!result.success) {
      alert(result.error);
      return;
    }

    await loadCheckIn();
    isEditing = false;
    renderContent();
  }

  function renderToolbar() {
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '10px';

    if (isEditing) {
      const saveButton = document.createElement('button');
      saveButton.className = 'btn btn-primary';
      saveButton.textContent = 'Save Check-in';
      saveButton.setAttribute('aria-label', 'Save daily check-in');
      saveButton.addEventListener('click', saveCurrentCheckIn);
      toolbar.appendChild(saveButton);

      if (currentCheckIn) {
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
          isEditing = false;
          renderContent();
        });
        toolbar.appendChild(cancelButton);
      }
    } else if (currentCheckIn) {
      const editButton = document.createElement('button');
      editButton.className = 'btn btn-primary';
      editButton.textContent = 'Edit Today';
      editButton.setAttribute('aria-label', 'Edit today check-in');
      editButton.addEventListener('click', () => {
        isEditing = true;
        renderContent();
      });
      toolbar.appendChild(editButton);
    }

    const historyButton = document.createElement('button');
    historyButton.className = 'btn btn-secondary';
    historyButton.textContent = 'View Previous Check-ins';
    historyButton.setAttribute('aria-label', 'View previous check-ins');
    historyButton.addEventListener('click', showHistory);
    toolbar.appendChild(historyButton);

    return toolbar;
  }

  function renderContent() {
    content.innerHTML = '';

    if (!currentCheckIn && !isEditing) {
      isEditing = true;
    }

    content.appendChild(renderToolbar());

    if (!currentCheckIn && isEditing) {
      content.appendChild(createEmptyState());
    }

    if (isEditing) {
      formComponent = new CheckInForm({ initialData: currentCheckIn || {} });
      content.appendChild(formComponent.render());
      return;
    }

    if (currentCheckIn) {
      content.appendChild(createTodaySummary(currentCheckIn));
    }
  }

  content.innerHTML = `
    <div class="card" style="padding: 24px;">
      <div class="skeleton" style="height: 24px; width: 180px; margin-bottom: 16px; border-radius: 6px;"></div>
      <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 10px; border-radius: 6px;"></div>
      <div class="skeleton" style="height: 16px; width: 72%; border-radius: 6px;"></div>
    </div>
  `;

  loadCheckIn().then(renderContent);

  return page;
}
