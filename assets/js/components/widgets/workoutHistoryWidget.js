
/**
 * Workout History Widget
 */

import { BaseWidget } from './baseWidget.js';
import workoutRepository from '../../repositories/workoutRepository.js';
import { showModal, hideModal } from '../modal.js';

export class WorkoutHistoryWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-workout-history', ...options });
  }

  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 30px; width: 200px; margin-bottom: 16px;"></div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="skeleton" style="height: 120px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 120px; border-radius: 12px;"></div>
        </div>
      </div>
    `;
  }

  getEmptyStateHTML() {
    return `
      <div style="padding: 40px 24px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">📅</div>
        <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No Workout Yet.</h4>
        <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Start by creating your first workout.</p>
      </div>
    `;
  }

  getContentHTML(data) {
    const { workouts } = data;
    if (!workouts || workouts.length === 0) {
      return `
        <div style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Workout History</h3>
          ${this.getEmptyStateHTML()}
        </div>
      `;
    }

    // Sort workouts newest first
    const sorted = [...workouts].sort((a, b) => {
      const aTime = new Date(a.endTime || a.date || a.createdAt);
      const bTime = new Date(b.endTime || b.date || b.createdAt);
      return bTime - aTime;
    });

    return `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700;">Workout History</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${sorted.map(workout => `
            <div class="card" data-workout-id="${workout.id}" style="padding: 16px; margin: 0;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h4 style="margin: 0 0 4px 0; font-size: 16px;">${workout.name}</h4>
                  <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px;">
                    ${new Date(workout.date).toLocaleDateString()} • ${workout.duration} min
                  </div>
                  <div style="display: flex; gap: 16px; font-size: 13px; color: var(--color-text-secondary);">
                    <span>${workout.summary?.exercisesCompleted || 0} exercises</span>
                    <span>${workout.summary?.totalSets || 0} sets</span>
                    ${workout.summary?.averageRPE > 0 ? `<span>RPE: ${workout.summary?.averageRPE}</span>` : ''}
                  </div>
                </div>
                <button class="btn btn-icon btn-sm view-details-btn" data-workout-id="${workout.id}" aria-label="View workout details for ${workout.name}">👁️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // View details
    this.container.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.workoutId;
        const result = await workoutRepository.getById(id);
        if (result.success && result.data) {
          const workout = result.data;
          const details = document.createElement('div');
          details.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 4px;">Session</div>
                <div style="font-weight: 600;">${workout.name}</div>
                <div style="font-size: 13px; color: var(--color-text-muted);">
                  ${new Date(workout.date).toLocaleDateString()} • ${workout.duration || 0} min
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div class="card" style="padding: 12px; margin: 0;">
                  <div style="font-size: 12px; color: var(--color-text-muted);">Exercises Completed</div>
                  <div style="font-size: 20px; font-weight: 700;">${workout.summary?.exercisesCompleted || 0}</div>
                </div>
                <div class="card" style="padding: 12px; margin: 0;">
                  <div style="font-size: 12px; color: var(--color-text-muted);">Total Sets</div>
                  <div style="font-size: 20px; font-weight: 700;">${workout.summary?.totalSets || 0}</div>
                </div>
              </div>
              <div>
                <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 8px;">Exercises</div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${(workout.exercises || []).map(exercise => `
                    <div class="card" style="padding: 12px; margin: 0;">
                      <div style="font-weight: 600; margin-bottom: 6px;">${exercise.name}</div>
                      <div style="font-size: 13px; color: var(--color-text-muted);">
                        ${exercise.sets?.length || 0} completed set${exercise.sets?.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;

          showModal({
            title: 'Workout Details',
            content: details,
            actions: [
              { id: 'close', label: 'Close', className: 'btn', onClick: hideModal }
            ]
          });
        }
      });
    });
  }

  async loadData() {
    const result = await workoutRepository.getAll();
    const workouts = result.success ? result.data : [];
    return { workouts };
  }
}
