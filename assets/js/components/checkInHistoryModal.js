/**
 * Check-In History Modal
 */

import { showModal, hideModal } from './modal.js';

function yesNoLabel(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not set';
}

export function showCheckInHistoryModal(checkIns = []) {
  const content = document.createElement('div');

  if (!checkIns.length) {
    content.innerHTML = `
      <div style="padding: 12px 4px; text-align: center;">
        <div style="font-size: 56px; margin-bottom: 12px;">🌙</div>
        <h3 style="margin: 0 0 6px 0;">No check-ins yet</h3>
        <p style="margin: 0; color: var(--color-text-muted);">Your previous daily check-ins will show up here.</p>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${checkIns.map(checkIn => `
          <div class="card" style="padding: 16px; margin: 0;">
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; align-items: center;">
              <div>
                <div style="font-weight: 700; font-size: 16px;">${new Date(checkIn.date).toLocaleDateString()}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">Sleep ${checkIn.sleepHours}h • Energy ${checkIn.energyLevel}/5 • Stress ${checkIn.stressLevel}/5</div>
              </div>
              <div style="font-size: 12px; color: var(--color-text-muted);">Shoulder ${checkIn.shoulderPain}/10</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; color: var(--color-text-secondary);">
              <div>Sleep Quality: <strong>${checkIn.sleepQuality}/5</strong></div>
              <div>Motivation: <strong>${checkIn.motivation}/5</strong></div>
              <div>Nutrition: <strong>${yesNoLabel(checkIn.followedNutrition)}</strong></div>
              <div>Workout: <strong>${checkIn.completedWorkout === 'rest' ? 'Rest Day' : checkIn.completedWorkout === 'yes' ? 'Yes' : 'No'}</strong></div>
              <div>Water Goal: <strong>${yesNoLabel(checkIn.waterGoalReached)}</strong></div>
              <div>Knee Pain: <strong>${checkIn.kneePain}/10</strong></div>
            </div>
            ${checkIn.otherPain ? `<div style="margin-top: 10px; font-size: 13px; color: var(--color-text-secondary);"><strong>Other Pain:</strong> ${checkIn.otherPain}</div>` : ''}
            ${checkIn.notes ? `<div style="margin-top: 10px; font-size: 13px; color: var(--color-text-secondary);"><strong>Notes:</strong> ${checkIn.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  showModal({
    title: 'Previous Check-Ins',
    content,
    actions: [
      { id: 'close', label: 'Close', className: 'btn', onClick: hideModal }
    ]
  });
}
