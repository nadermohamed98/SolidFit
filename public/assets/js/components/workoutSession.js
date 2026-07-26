
/**
 * Workout Session Component
 */

import workoutRepository from '../repositories/workoutRepository.js';
import WorkoutModel from '../models/workoutModel.js';

export class WorkoutSession {
  constructor(options) {
    this.workout = options.workout;
    this.onFinish = options.onFinish || null;
    this.container = null;
    this.currentExerciseIndex = 0;
    this.restTimer = null;
    this.restOverlay = null;
    this.restTimeLeft = 0;
    this.isRestPaused = false;
    this.elapsedInterval = null;
    this.startTime = null;
    this.elapsedTime = 0;
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'workout-session page';
    this.container.style.padding = '0 0 80px 0'; // Space for bottom button

    // Start session
    this.startTime = this.workout.startTime ? new Date(this.workout.startTime) : new Date();
    this.workout.startTime = this.startTime.toISOString();

    this.renderLiveSession();
    this.startElapsedTimer();

    return this.container;
  }

  startElapsedTimer() {
    clearInterval(this.elapsedInterval);
    this.elapsedInterval = setInterval(() => {
      this.elapsedTime = Math.floor((new Date() - this.startTime) / 1000);
      this.updateElapsedDisplay();
    }, 1000);
    this.updateElapsedDisplay();
  }

  updateElapsedDisplay() {
    const elapsedEl = this.container.querySelector('#elapsed-time');
    if (elapsedEl) {
      const mins = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
      const secs = (this.elapsedTime % 60).toString().padStart(2, '0');
      elapsedEl.textContent = `${mins}:${secs}`;
    }
  }

  renderLiveSession() {
    this.container.innerHTML = '';

    if (!this.workout.exercises || this.workout.exercises.length === 0) {
      this.container.innerHTML = `
        <div style="padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">🏋️</div>
          <h3 style="margin: 0 0 8px 0;">No exercises in this session</h3>
          <p style="margin: 0; color: var(--color-text-muted);">Choose another template to start a workout.</p>
        </div>
      `;
      return;
    }

    const currentExercise = this.workout.exercises[this.currentExerciseIndex];
    const currentSet = currentExercise.sets.length;
    const progress = (this.currentExerciseIndex / this.workout.exercises.length) * 100;

    this.container.innerHTML = `
      <div style="padding: 16px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 style="margin: 0; font-size: 20px;">${this.workout.name}</h2>
            <div style="font-size: 14px; color: var(--color-text-muted);">
              Exercise ${this.currentExerciseIndex + 1} of ${this.workout.exercises.length}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 700;" id="elapsed-time">00:00</div>
            <div style="font-size: 12px; color: var(--color-text-muted);">Elapsed</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div style="height: 8px; background: var(--color-border); border-radius: 9999px; margin-bottom: 24px; overflow: hidden;">
          <div style="height: 100%; background: var(--color-primary); width: ${progress}%; transition: width 0.3s ease;"></div>
        </div>

        <!-- Exercise Card -->
        <div class="card" style="padding: 24px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 4px 0; font-size: 22px;">${currentExercise.name}</h3>
          ${currentExercise.targetMuscle ? `<span style="font-size: 13px; color: var(--color-text-muted); background: var(--color-card-hover); padding: 4px 8px; border-radius: 9999px; display: inline-block; margin-bottom: 16px;">${currentExercise.targetMuscle}</span>` : '<div style="margin-bottom: 16px;"></div>'}

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Set</div>
              <div style="font-size: 20px; font-weight: 700;">${currentSet + 1}${currentExercise.setsTarget ? `/${currentExercise.setsTarget}` : ''}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Target Reps</div>
              <div style="font-size: 20px; font-weight: 700;">${currentExercise.repsTarget || '-'}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Rest</div>
              <div style="font-size: 20px; font-weight: 700;">${currentExercise.restTime || 0}s</div>
            </div>
          </div>

          <form id="set-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              <div class="input-group">
                <label class="input-label" for="set-weight">Weight</label>
                <input id="set-weight" class="input-field" type="number" min="0" step="0.5" placeholder="e.g., 100">
              </div>
              <div class="input-group">
                <label class="input-label" for="set-reps">Reps</label>
                <input id="set-reps" class="input-field" type="number" min="1" placeholder="e.g., 10" required>
              </div>
              <div class="input-group">
                <label class="input-label" for="set-rpe">RPE</label>
                <select id="set-rpe" class="input-field">
                  <option value="">-</option>
                  ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="input-group">
              <label class="input-label" for="set-notes">Notes</label>
              <textarea id="set-notes" class="input-field" rows="2" placeholder="Add set notes..."></textarea>
            </div>
          </form>
        </div>

        <!-- Sets history for current exercise -->
        ${currentExercise.sets.length > 0 ? `
          <div class="card" style="padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px;">Completed Sets</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${currentExercise.sets.map((set, idx) => `
                <div style="padding: 8px 12px; background: var(--color-card-hover); border-radius: 8px; font-size: 13px;">
                  Set ${idx + 1}: ${set.weight ? `${set.weight} lbs × ` : ''}${set.reps} reps${set.rpe ? ` @ ${set.rpe} RPE` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Bottom actions -->
      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: var(--color-background); padding: 12px 16px; border-top: 1px solid var(--color-border); display: flex; gap: 8px; z-index: 40;">
        ${this.currentExerciseIndex > 0 ? `
          <button class="btn" id="prev-exercise-btn" style="flex: 1;" aria-label="Go to previous exercise">Previous</button>
        ` : '<div style="flex: 1;"></div>'}
        <button class="btn" id="skip-exercise-btn" style="flex: 1;" aria-label="Skip current exercise">Skip</button>
        <button class="btn btn-primary" id="save-set-btn" style="flex: 1;" aria-label="Save current set">Save Set</button>
        ${this.currentExerciseIndex < this.workout.exercises.length - 1 ? `
          <button class="btn" id="next-exercise-btn" style="flex: 1;" aria-label="Go to next exercise">Next</button>
        ` : '<div style="flex: 1;"></div>'}
        <button class="btn" id="finish-workout-btn" style="flex: 1;" aria-label="Finish workout">Finish</button>
      </div>
    `;

    this.attachLiveSessionListeners();
  }

  attachLiveSessionListeners() {
    // Previous
    const prevBtn = this.container.querySelector('#prev-exercise-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentExerciseIndex > 0) {
          this.currentExerciseIndex--;
          this.renderLiveSession();
        }
      });
    }

    // Skip
    const skipBtn = this.container.querySelector('#skip-exercise-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
          this.currentExerciseIndex++;
          this.renderLiveSession();
        } else {
          this.renderSummary();
        }
      });
    }

    // Save Set
    const saveBtn = this.container.querySelector('#save-set-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const weightInput = this.container.querySelector('#set-weight');
        const repsInput = this.container.querySelector('#set-reps');
        const rpeInput = this.container.querySelector('#set-rpe');

        if (!repsInput.value) {
          alert('Please enter the number of reps.');
          return;
        }

        // Save set
        const newSet = {
          weight: parseFloat(weightInput.value) || 0,
          reps: parseInt(repsInput.value) || 0,
          rpe: rpeInput.value ? parseInt(rpeInput.value) : null,
          notes: this.container.querySelector('#set-notes').value.trim(),
          completedAt: new Date().toISOString()
        };
        this.workout.exercises[this.currentExerciseIndex].sets.push(newSet);

        // Save workout to DB (update)
        await workoutRepository.save(this.workout);

        // Show rest timer
        this.showRestTimer();
      });
    }

    // Next
    const nextBtn = this.container.querySelector('#next-exercise-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
          this.currentExerciseIndex++;
          this.renderLiveSession();
        }
      });
    }

    // Finish
    const finishBtn = this.container.querySelector('#finish-workout-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.renderSummary();
      });
    }
  }

  showRestTimer() {
    const currentExercise = this.workout.exercises[this.currentExerciseIndex];
    this.restTimeLeft = currentExercise.restTime || 90;
    this.isRestPaused = false;
    clearInterval(this.restTimer);

    // Create overlay
    const overlay = document.createElement('div');
    this.restOverlay = overlay;
    overlay.className = 'modal-overlay open';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="modal" style="max-width: 400px; width: 90%;">
        <div class="modal-body" style="text-align: center; padding: 32px;">
          <h3 style="margin: 0 0 8px 0; font-size: 20px;">Rest Timer</h3>
          <p style="margin: 0 0 24px 0; color: var(--color-text-muted);">Take a breath!</p>
          <div id="rest-time-display" style="font-size: 64px; font-weight: 700; margin-bottom: 24px;">
            ${Math.floor(this.restTimeLeft / 60)}:${(this.restTimeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="btn" id="pause-rest-btn">${this.isRestPaused ? 'Resume' : 'Pause'}</button>
            <button class="btn" id="restart-rest-btn">Restart</button>
            <button class="btn btn-primary" id="skip-rest-btn">Skip Rest</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Start timer
    this.restTimer = setInterval(() => {
      if (!this.isRestPaused) {
        this.restTimeLeft--;
        if (this.restTimeLeft <= 0) {
          clearInterval(this.restTimer);
          overlay.remove();
          this.restOverlay = null;
          // Check if done with exercise
          const exercise = this.workout.exercises[this.currentExerciseIndex];
          if (exercise.setsTarget && exercise.sets.length >= exercise.setsTarget) {
            if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
              this.currentExerciseIndex++;
            } else {
              this.renderSummary();
              return;
            }
          }
          this.renderLiveSession();
        }
        this.updateRestTimerDisplay(overlay);
      }
    }, 1000);

    // Attach listeners
    const pauseBtn = overlay.querySelector('#pause-rest-btn');
    const restartBtn = overlay.querySelector('#restart-rest-btn');
    const skipBtn = overlay.querySelector('#skip-rest-btn');

    pauseBtn.addEventListener('click', () => {
      this.isRestPaused = !this.isRestPaused;
      pauseBtn.textContent = this.isRestPaused ? 'Resume' : 'Pause';
    });

    restartBtn.addEventListener('click', () => {
      this.restTimeLeft = currentExercise.restTime || 90;
      this.isRestPaused = false;
      pauseBtn.textContent = 'Pause';
      this.updateRestTimerDisplay(overlay);
    });

    skipBtn.addEventListener('click', () => {
      clearInterval(this.restTimer);
      overlay.remove();
      this.restOverlay = null;
      const exercise = this.workout.exercises[this.currentExerciseIndex];
      if (exercise.setsTarget && exercise.sets.length >= exercise.setsTarget) {
        if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
          this.currentExerciseIndex++;
        } else {
          this.renderSummary();
          return;
        }
      }
      this.renderLiveSession();
    });
  }

  updateRestTimerDisplay(overlay) {
    const display = overlay.querySelector('#rest-time-display');
    if (display) {
      const mins = Math.floor(this.restTimeLeft / 60).toString();
      const secs = (this.restTimeLeft % 60).toString().padStart(2, '0');
      display.textContent = `${mins}:${secs}`;
    }
  }

  renderSummary() {
    clearInterval(this.elapsedInterval);
    clearInterval(this.restTimer);

    // Calculate duration
    const endTime = new Date();
    this.workout.endTime = endTime.toISOString();
    this.workout.duration = Math.ceil((endTime - this.startTime) / 1000 / 60);
    this.workout.summary = WorkoutModel.calculateSummary(this.workout);

    this.container.innerHTML = '';

    this.container.innerHTML = `
      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
          <h2 style="margin: 0 0 4px 0;">Workout Complete!</h2>
          <p style="margin: 0; color: var(--color-text-muted);">Great job!</p>
        </div>

        <!-- Summary Stats -->
        <div class="card" style="padding: 24px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px;">Summary</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Duration</div>
              <div style="font-size: 22px; font-weight: 700;">${this.workout.duration} min</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Exercises</div>
              <div style="font-size: 22px; font-weight: 700;">${this.workout.summary.exercisesCompleted}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Total Sets</div>
              <div style="font-size: 22px; font-weight: 700;">${this.workout.summary.totalSets}</div>
            </div>
            <div style="text-align: center; padding: 12px; background: var(--color-card-hover); border-radius: 8px;">
              <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">Avg RPE</div>
              <div style="font-size: 22px; font-weight: 700;">${this.workout.summary.averageRPE || '-'}</div>
            </div>
          </div>
        </div>

        <!-- Feedback Form -->
        <div class="card" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px;">Post-Workout Feedback</h3>
          <form id="feedback-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="input-group">
              <label class="input-label" for="workout-notes">Notes</label>
              <textarea id="workout-notes" class="input-field" rows="3" placeholder="How was the workout?">${this.workout.summary.notes || ''}</textarea>
            </div>
            <div class="input-group">
              <label class="input-label">Shoulder Pain (0-10)</label>
              <input id="shoulder-pain" class="input-field" type="range" min="0" max="10" value="${this.workout.summary.shoulderPain || 0}">
              <div style="text-align: center;" id="shoulder-pain-display">${this.workout.summary.shoulderPain || 0}</div>
            </div>
            <div class="input-group">
              <label class="input-label">Knee Pain (0-10)</label>
              <input id="knee-pain" class="input-field" type="range" min="0" max="10" value="${this.workout.summary.kneePain || 0}">
              <div style="text-align: center;" id="knee-pain-display">${this.workout.summary.kneePain || 0}</div>
            </div>
            <div class="input-group">
              <label class="input-label">Overall Feeling</label>
              <select id="overall-feeling" class="input-field">
                <option value="Amazing" ${this.workout.summary.overallFeeling === 'Amazing' ? 'selected' : ''}>Amazing</option>
                <option value="Great" ${this.workout.summary.overallFeeling === 'Great' ? 'selected' : ''}>Great</option>
                <option value="Good" ${this.workout.summary.overallFeeling === 'Good' ? 'selected' : ''}>Good</option>
                <option value="Okay" ${this.workout.summary.overallFeeling === 'Okay' ? 'selected' : ''}>Okay</option>
                <option value="Tough" ${this.workout.summary.overallFeeling === 'Tough' ? 'selected' : ''}>Tough</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: var(--color-background); padding: 12px 16px; border-top: 1px solid var(--color-border); display: flex; gap: 8px; z-index: 40;">
        <button class="btn" id="cancel-finish-btn" style="flex: 1;">Back to Workout</button>
        <button class="btn btn-primary" id="save-workout-btn" style="flex: 2;">Save & Finish</button>
      </div>
    `;

    this.attachSummaryListeners();
  }

  attachSummaryListeners() {
    const shoulderInput = this.container.querySelector('#shoulder-pain');
    const shoulderDisplay = this.container.querySelector('#shoulder-pain-display');
    const kneeInput = this.container.querySelector('#knee-pain');
    const kneeDisplay = this.container.querySelector('#knee-pain-display');

    shoulderInput.addEventListener('input', () => shoulderDisplay.textContent = shoulderInput.value);
    kneeInput.addEventListener('input', () => kneeDisplay.textContent = kneeInput.value);

    // Cancel
    const cancelBtn = this.container.querySelector('#cancel-finish-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.renderLiveSession();
        this.startElapsedTimer();
      });
    }

    // Save
    const saveBtn = this.container.querySelector('#save-workout-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        // Update summary
        this.workout.summary.notes = this.container.querySelector('#workout-notes').value;
        this.workout.summary.shoulderPain = parseInt(this.container.querySelector('#shoulder-pain').value);
        this.workout.summary.kneePain = parseInt(this.container.querySelector('#knee-pain').value);
        this.workout.summary.overallFeeling = this.container.querySelector('#overall-feeling').value;
        this.workout.completed = true;

        const result = await workoutRepository.save(this.workout);
        if (result.success) {
          if (this.onFinish) {
            this.onFinish();
          }
        } else {
          alert(result.error);
        }
      });
    }
  }

  destroy() {
    clearInterval(this.elapsedInterval);
    clearInterval(this.restTimer);
    if (this.restOverlay) {
      this.restOverlay.remove();
      this.restOverlay = null;
    }
    if (this.container) {
      this.container.remove();
    }
  }
}
