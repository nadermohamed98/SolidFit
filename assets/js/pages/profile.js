/**
 * Profile Settings Page
 */

import profileRepository from '../repositories/profileRepository.js';

function createField({ id, label, type = 'text', value = '', placeholder = '', min = '', max = '', step = '' }) {
  return `
    <div class="input-group" style="margin-bottom: 0;">
      <label class="input-label" for="${id}">${label}</label>
      <input
        id="${id}"
        class="input-field"
        type="${type}"
        value="${value ?? ''}"
        placeholder="${placeholder}"
        ${min !== '' ? `min="${min}"` : ''}
        ${max !== '' ? `max="${max}"` : ''}
        ${step !== '' ? `step="${step}"` : ''}
      >
    </div>
  `;
}

function createDayToggle(day, selectedDays = []) {
  const isSelected = selectedDays.includes(day);
  return `
    <label style="display: inline-flex; align-items: center; cursor: pointer;">
      <input type="checkbox" value="${day}" data-gym-day ${isSelected ? 'checked' : ''} style="position: absolute; opacity: 0; pointer-events: none;">
      <span
        data-gym-day-chip="${day}"
        style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          padding: 10px 12px;
          border-radius: 9999px;
          border: 1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'};
          background: ${isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-card)'};
          color: ${isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
          font-size: 13px;
          font-weight: 600;
          transition: all var(--duration-fast) var(--easing-default);
        "
      >
        ${day}
      </span>
    </label>
  `;
}

/**
 * Render profile page
 * @returns {HTMLElement}
 */
export function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Profile Settings</h1>
      <p class="page-subtitle">Keep your training profile up to date.</p>
    </div>
  `;

  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '16px';
  page.appendChild(content);

  let currentProfile = null;

  function renderForm(profile = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.style.padding = '24px';

    wrapper.innerHTML = `
      <form id="profile-form" style="display: flex; flex-direction: column; gap: 20px;">
        <section style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <h2 style="margin: 0 0 4px 0; font-size: 18px;">Profile</h2>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Basic personal and training details.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            ${createField({
              id: 'profile-name',
              label: 'Name',
              value: profile.name || '',
              placeholder: 'Your name'
            })}
            ${createField({
              id: 'profile-age',
              label: 'Age',
              type: 'number',
              value: profile.age,
              min: 0,
              max: 120,
              placeholder: 'Age'
            })}
            ${createField({
              id: 'profile-height',
              label: 'Height (cm)',
              type: 'number',
              value: profile.height,
              min: 0,
              max: 300,
              step: 0.1,
              placeholder: 'Height'
            })}
            ${createField({
              id: 'profile-current-weight',
              label: 'Current Weight (kg)',
              type: 'number',
              value: profile.currentWeight,
              min: 0,
              max: 500,
              step: 0.1,
              placeholder: 'Current weight'
            })}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div class="input-group" style="margin-bottom: 0;">
              <label class="input-label" for="profile-goal">Goal</label>
              <select id="profile-goal" class="input-field">
                <option value="">Select goal</option>
                <option value="Lose Fat" ${profile.goal === 'Lose Fat' ? 'selected' : ''}>Lose Fat</option>
                <option value="Build Muscle" ${profile.goal === 'Build Muscle' ? 'selected' : ''}>Build Muscle</option>
                <option value="Maintain" ${profile.goal === 'Maintain' ? 'selected' : ''}>Maintain</option>
                <option value="Improve Fitness" ${profile.goal === 'Improve Fitness' ? 'selected' : ''}>Improve Fitness</option>
              </select>
            </div>

            <div class="input-group" style="margin-bottom: 0;">
              <label class="input-label" for="profile-activity-level">Activity Level</label>
              <select id="profile-activity-level" class="input-field">
                <option value="">Select activity level</option>
                <option value="Sedentary" ${profile.activityLevel === 'Sedentary' ? 'selected' : ''}>Sedentary</option>
                <option value="Lightly Active" ${profile.activityLevel === 'Lightly Active' ? 'selected' : ''}>Lightly Active</option>
                <option value="Moderately Active" ${profile.activityLevel === 'Moderately Active' ? 'selected' : ''}>Moderately Active</option>
                <option value="Very Active" ${profile.activityLevel === 'Very Active' ? 'selected' : ''}>Very Active</option>
              </select>
            </div>

            ${createField({
              id: 'profile-training-days',
              label: 'Training Days Per Week',
              type: 'number',
              value: profile.trainingDaysPerWeek,
              min: 0,
              max: 7,
              step: 1,
              placeholder: '0-7'
            })}
          </div>
        </section>

        <section style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px;">
          <div>
            <h2 style="margin: 0 0 4px 0; font-size: 18px;">Training Preferences</h2>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Stored preferences only. No scheduling or reminders.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div class="input-group" style="margin-bottom: 0;">
              <label class="input-label" for="profile-workout-time">Workout Time</label>
              <select id="profile-workout-time" class="input-field">
                <option value="">Select workout time</option>
                <option value="Morning" ${profile.workoutTime === 'Morning' ? 'selected' : ''}>Morning</option>
                <option value="Evening" ${profile.workoutTime === 'Evening' ? 'selected' : ''}>Evening</option>
              </select>
            </div>

            ${createField({
              id: 'profile-workout-duration',
              label: 'Workout Duration (minutes)',
              type: 'number',
              value: profile.workoutDuration,
              min: 0,
              max: 600,
              step: 5,
              placeholder: 'e.g. 60'
            })}
          </div>

          <div class="input-group" style="margin-bottom: 0;">
            <label class="input-label">Gym Days</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => createDayToggle(day, profile.gymDays || [])).join('')}
            </div>
          </div>
        </section>

        <section style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px;">
          <div>
            <h2 style="margin: 0 0 4px 0; font-size: 18px;">Nutrition Goals</h2>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">These values are used across the dashboard and nutrition widgets.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            ${createField({
              id: 'profile-calories-goal',
              label: 'Calories Goal',
              type: 'number',
              value: profile.caloriesGoal,
              min: 0,
              max: 10000,
              step: 1,
              placeholder: 'e.g. 2200'
            })}
            ${createField({
              id: 'profile-protein-goal',
              label: 'Protein Goal',
              type: 'number',
              value: profile.proteinGoal,
              min: 0,
              max: 1000,
              step: 1,
              placeholder: 'e.g. 160'
            })}
            ${createField({
              id: 'profile-carbs-goal',
              label: 'Carbs Goal',
              type: 'number',
              value: profile.carbsGoal,
              min: 0,
              max: 1000,
              step: 1,
              placeholder: 'e.g. 250'
            })}
            ${createField({
              id: 'profile-fat-goal',
              label: 'Fat Goal',
              type: 'number',
              value: profile.fatGoal,
              min: 0,
              max: 500,
              step: 1,
              placeholder: 'e.g. 70'
            })}
            ${createField({
              id: 'profile-water-goal',
              label: 'Water Goal',
              type: 'number',
              value: profile.waterGoal,
              min: 0,
              max: 20,
              step: 0.1,
              placeholder: 'e.g. 2.5'
            })}
          </div>
        </section>

        <div style="display: flex; justify-content: flex-end;">
          <button type="submit" class="btn btn-primary" aria-label="Save profile">Save</button>
        </div>
      </form>
    `;

    return wrapper;
  }

  function renderStatus(message, isError = false) {
    const status = document.createElement('div');
    status.className = 'card';
    status.style.padding = '16px';
    status.style.borderColor = isError ? 'var(--color-danger)' : 'var(--color-primary)';
    status.style.background = isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)';
    status.style.color = isError ? 'var(--color-danger)' : 'var(--color-text-primary)';
    status.textContent = message;
    return status;
  }

  async function saveProfile(event) {
    event.preventDefault();

    const form = content.querySelector('#profile-form');
    if (!form) return;

    const selectedGymDays = Array.from(form.querySelectorAll('[data-gym-day]:checked')).map(input => input.value);

    const payload = {
      ...currentProfile,
      name: form.querySelector('#profile-name').value.trim(),
      age: form.querySelector('#profile-age').value ? parseInt(form.querySelector('#profile-age').value, 10) : null,
      height: form.querySelector('#profile-height').value ? parseFloat(form.querySelector('#profile-height').value) : null,
      currentWeight: form.querySelector('#profile-current-weight').value ? parseFloat(form.querySelector('#profile-current-weight').value) : null,
      goal: form.querySelector('#profile-goal').value,
      activityLevel: form.querySelector('#profile-activity-level').value,
      trainingDaysPerWeek: form.querySelector('#profile-training-days').value ? parseInt(form.querySelector('#profile-training-days').value, 10) : null,
      workoutTime: form.querySelector('#profile-workout-time').value,
      gymDays: selectedGymDays,
      workoutDuration: form.querySelector('#profile-workout-duration').value ? parseInt(form.querySelector('#profile-workout-duration').value, 10) : null,
      caloriesGoal: form.querySelector('#profile-calories-goal').value ? parseInt(form.querySelector('#profile-calories-goal').value, 10) : null,
      proteinGoal: form.querySelector('#profile-protein-goal').value ? parseInt(form.querySelector('#profile-protein-goal').value, 10) : null,
      carbsGoal: form.querySelector('#profile-carbs-goal').value ? parseInt(form.querySelector('#profile-carbs-goal').value, 10) : null,
      fatGoal: form.querySelector('#profile-fat-goal').value ? parseInt(form.querySelector('#profile-fat-goal').value, 10) : null,
      waterGoal: form.querySelector('#profile-water-goal').value ? parseFloat(form.querySelector('#profile-water-goal').value) : null
    };

    const result = await profileRepository.save(payload);
    if (!result.success) {
      const existingStatus = content.querySelector('[data-profile-status]');
      if (existingStatus) existingStatus.remove();
      const status = renderStatus(result.error || 'Failed to save profile.', true);
      status.dataset.profileStatus = 'true';
      content.prepend(status);
      return;
    }

    currentProfile = result.data;
    const existingStatus = content.querySelector('[data-profile-status]');
    if (existingStatus) existingStatus.remove();
    const status = renderStatus('Profile saved successfully.');
    status.dataset.profileStatus = 'true';
    content.prepend(status);
    window.dispatchEvent(new CustomEvent('solidfit:data-changed', { bubbles: true }));
  }

  async function loadProfile() {
    content.innerHTML = `
      <div class="card" style="padding: 24px;">
        <div class="skeleton" style="height: 24px; width: 180px; margin-bottom: 16px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 100%; margin-bottom: 12px; border-radius: 6px;"></div>
        <div class="skeleton" style="height: 16px; width: 72%; border-radius: 6px;"></div>
      </div>
    `;

    const result = await profileRepository.getProfile();
    currentProfile = result.success ? result.data : null;

    content.innerHTML = '';

    if (!result.success) {
      const status = renderStatus(result.error || 'Failed to load profile.', true);
      status.dataset.profileStatus = 'true';
      content.appendChild(status);
    }

    const formCard = renderForm(currentProfile || {});
    content.appendChild(formCard);

    const form = content.querySelector('#profile-form');
    if (form) {
      form.addEventListener('submit', saveProfile);
      form.querySelectorAll('[data-gym-day]').forEach(input => {
        input.addEventListener('change', () => {
          const chip = form.querySelector(`[data-gym-day-chip="${input.value}"]`);
          if (!chip) return;
          chip.style.borderColor = input.checked ? 'var(--color-primary)' : 'var(--color-border)';
          chip.style.background = input.checked ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-card)';
          chip.style.color = input.checked ? 'var(--color-primary)' : 'var(--color-text-secondary)';
        });
      });
    }
  }

  loadProfile();

  return page;
}
