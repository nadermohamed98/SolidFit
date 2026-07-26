/**
 * Daily Check-In Form Component
 */

function renderSliderField({ id, label, min, max, step = 1, value, helper = '' }) {
  return `
    <div class="input-group" style="margin-bottom: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <label class="input-label" for="${id}" style="margin-bottom: 0;">${label}</label>
        <span id="${id}-value" style="font-size: 14px; font-weight: 600; color: var(--color-primary);">${value}</span>
      </div>
      <input
        id="${id}"
        class="checkin-range"
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        aria-label="${label}"
        style="width: 100%; accent-color: var(--color-primary);"
      >
      ${helper ? `<div style="margin-top: 8px; font-size: 12px; color: var(--color-text-muted);">${helper}</div>` : ''}
    </div>
  `;
}

function renderChoiceGroup({ name, label, options, value }) {
  return `
    <div class="input-group" style="margin-bottom: 0;">
      <label class="input-label">${label}</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${options.map(option => `
          <label style="display: inline-flex; align-items: center; cursor: pointer;">
            <input type="radio" name="${name}" value="${option.value}" ${value === option.value ? 'checked' : ''} style="position: absolute; opacity: 0; pointer-events: none;">
            <span
              data-choice="${name}"
              data-value="${option.value}"
              style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 92px;
                padding: 10px 14px;
                border-radius: 9999px;
                border: 1px solid ${value === option.value ? 'var(--color-primary)' : 'var(--color-border)'};
                background: ${value === option.value ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-card)'};
                color: ${value === option.value ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
                font-size: 14px;
                font-weight: 600;
                transition: all var(--duration-fast) var(--easing-default);
              "
            >
              ${option.label}
            </span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

export class CheckInForm {
  constructor(options = {}) {
    this.initialData = options.initialData || {};
    this.container = null;
  }

  render() {
    const checkIn = {
      sleepHours: 7,
      sleepQuality: 3,
      energyLevel: 3,
      motivation: 3,
      stressLevel: 3,
      shoulderPain: 0,
      kneePain: 0,
      otherPain: '',
      followedNutrition: false,
      completedWorkout: 'rest',
      waterGoalReached: false,
      notes: '',
      ...this.initialData
    };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <form id="daily-checkin-form" style="display: flex; flex-direction: column; gap: 16px;">
        <section class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">Sleep</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Quick check on how you slept last night.</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${renderSliderField({ id: 'sleepHours', label: 'Hours Slept', min: 0, max: 12, step: 0.5, value: checkIn.sleepHours, helper: '0 to 12 hours' })}
            ${renderSliderField({ id: 'sleepQuality', label: 'Sleep Quality', min: 1, max: 5, value: checkIn.sleepQuality, helper: '1 = rough, 5 = excellent' })}
          </div>
        </section>

        <section class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">Recovery</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">How ready do you feel today?</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${renderSliderField({ id: 'energyLevel', label: 'Energy Level', min: 1, max: 5, value: checkIn.energyLevel })}
            ${renderSliderField({ id: 'motivation', label: 'Motivation', min: 1, max: 5, value: checkIn.motivation })}
            ${renderSliderField({ id: 'stressLevel', label: 'Stress Level', min: 1, max: 5, value: checkIn.stressLevel })}
          </div>
        </section>

        <section class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">Pain Tracking</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Flag anything that needs attention.</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${renderSliderField({ id: 'shoulderPain', label: 'Shoulder Pain', min: 0, max: 10, value: checkIn.shoulderPain })}
            ${renderSliderField({ id: 'kneePain', label: 'Knee Pain', min: 0, max: 10, value: checkIn.kneePain })}
            <div class="input-group" style="margin-bottom: 0;">
              <label class="input-label" for="otherPain">Other Pain</label>
              <textarea id="otherPain" class="input-field" rows="3" placeholder="Optional note about any other pain...">${checkIn.otherPain}</textarea>
            </div>
          </div>
        </section>

        <section class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">Daily Status</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Three quick yes/no checks.</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${renderChoiceGroup({
              name: 'followedNutrition',
              label: 'Followed nutrition?',
              value: String(checkIn.followedNutrition),
              options: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
              ]
            })}
            ${renderChoiceGroup({
              name: 'completedWorkout',
              label: 'Completed workout?',
              value: checkIn.completedWorkout,
              options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'rest', label: 'Rest Day' }
              ]
            })}
            ${renderChoiceGroup({
              name: 'waterGoalReached',
              label: 'Water goal reached?',
              value: String(checkIn.waterGoalReached),
              options: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
              ]
            })}
          </div>
        </section>

        <section class="card" style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px;">Notes</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Unexpected events, poor sleep reasons, travel, soreness, anything useful.</p>
          </div>
          <div class="input-group" style="margin-bottom: 0;">
            <label class="input-label" for="notes">Notes</label>
            <textarea id="notes" class="input-field" rows="5" placeholder="Optional notes for today...">${checkIn.notes}</textarea>
          </div>
        </section>
      </form>
    `;

    this.container = wrapper.firstElementChild;
    this.attachEventListeners();
    return this.container;
  }

  attachEventListeners() {
    if (!this.container) return;

    this.container.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', () => {
        const output = this.container.querySelector(`#${input.id}-value`);
        if (output) {
          output.textContent = input.value;
        }
      });
    });

    this.container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const group = radio.name;
        this.container.querySelectorAll(`[data-choice="${group}"]`).forEach(choice => {
          const active = choice.dataset.value === radio.value;
          choice.style.borderColor = active ? 'var(--color-primary)' : 'var(--color-border)';
          choice.style.background = active ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-card)';
          choice.style.color = active ? 'var(--color-primary)' : 'var(--color-text-secondary)';
        });
      });
    });
  }

  getValue() {
    const form = this.container;
    const followedNutritionValue = form.querySelector('input[name="followedNutrition"]:checked')?.value;
    const waterGoalValue = form.querySelector('input[name="waterGoalReached"]:checked')?.value;
    return {
      sleepHours: parseFloat(form.querySelector('#sleepHours').value),
      sleepQuality: parseInt(form.querySelector('#sleepQuality').value, 10),
      energyLevel: parseInt(form.querySelector('#energyLevel').value, 10),
      motivation: parseInt(form.querySelector('#motivation').value, 10),
      stressLevel: parseInt(form.querySelector('#stressLevel').value, 10),
      shoulderPain: parseInt(form.querySelector('#shoulderPain').value, 10),
      kneePain: parseInt(form.querySelector('#kneePain').value, 10),
      otherPain: form.querySelector('#otherPain').value.trim(),
      followedNutrition: followedNutritionValue === undefined ? null : followedNutritionValue === 'true',
      completedWorkout: form.querySelector('input[name="completedWorkout"]:checked')?.value || 'rest',
      waterGoalReached: waterGoalValue === undefined ? null : waterGoalValue === 'true',
      notes: form.querySelector('#notes').value.trim()
    };
  }
}
