
/**
 * Workout Templates Widget
 */

import { BaseWidget } from './baseWidget.js';
import workoutTemplateRepository from '../../repositories/workoutTemplateRepository.js';
import WorkoutTemplateModel from '../../models/workoutTemplateModel.js';
import { showModal, hideModal } from '../modal.js';
import { getIcon } from '../sidebar.js';

export class WorkoutTemplatesWidget extends BaseWidget {
  constructor(options = {}) {
    super({ className: 'widget-workout-templates', ...options });
    this.onTemplateSelect = options.onTemplateSelect || null;
  }

  getEmptyStateHTML() {
    return `
      <div style="padding: 40px 24px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">🏋️</div>
        <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No templates yet</h4>
        <p style="margin: 0; color: var(--color-text-muted); font-size: 14px;">Create your first workout template to get started!</p>
      </div>
    `;
  }

  getSkeletonHTML() {
    return `
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 30px; width: 200px; margin-bottom: 16px;"></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          <div class="skeleton" style="height: 160px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 160px; border-radius: 12px;"></div>
        </div>
      </div>
    `;
  }

  getContentHTML(data) {
    const { templates } = data;
    const sectionTitle = this.onTemplateSelect ? 'Current Program' : 'Workout Templates';
    if (!templates || templates.length === 0) {
      return `
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${sectionTitle}</h3>
            <button class="btn btn-primary btn-sm" id="add-template-btn" aria-label="Create workout template">
              ${getIcon('plus')} New Template
            </button>
          </div>
          ${this.getEmptyStateHTML()}
        </div>
      `;
    }

    return `
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${sectionTitle}</h3>
          <button class="btn btn-primary btn-sm" id="add-template-btn" aria-label="Create workout template">
            ${getIcon('plus')} New Template
          </button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          ${templates.map(template => `
            <div class="card" data-template-id="${template.id}" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h4 style="margin: 0 0 4px 0; font-size: 16px;">${template.name}</h4>
                  <span style="font-size: 12px; color: var(--color-text-muted); background: var(--color-card-hover); padding: 4px 8px; border-radius: 9999px;">${template.category}</span>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-icon btn-sm duplicate-template-btn" data-template-id="${template.id}" title="Duplicate" aria-label="Duplicate ${template.name}">📋</button>
                  <button class="btn btn-icon btn-sm edit-template-btn" data-template-id="${template.id}" title="Edit" aria-label="Edit ${template.name}">✏️</button>
                  <button class="btn btn-icon btn-sm delete-template-btn" data-template-id="${template.id}" title="Delete" aria-label="Delete ${template.name}">🗑️</button>
                </div>
              </div>
              <div style="margin-top: 12px; font-size: 14px; color: var(--color-text-muted);">
                ${template.exercises.length} exercise${template.exercises.length !== 1 ? 's' : ''}
              </div>
              ${this.onTemplateSelect ? `
                <button class="btn btn-primary btn-sm" style="width: 100%; margin-top: 12px;" data-use-template-id="${template.id}" aria-label="Start workout using ${template.name}">
                  Use Template
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Add new template
    const addBtn = this.container.querySelector('#add-template-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showTemplateForm());
    }

    // Edit, Duplicate, Delete
    this.container.querySelectorAll('.edit-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.templateId;
        this.showTemplateForm(id);
      });
    });
    this.container.querySelectorAll('.duplicate-template-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.templateId;
        await workoutTemplateRepository.duplicate(id);
      });
    });
    this.container.querySelectorAll('.delete-template-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.templateId;
        if (confirm('Are you sure you want to delete this template?')) {
          await workoutTemplateRepository.delete(id);
        }
      });
    });

    // Use template
    if (this.onTemplateSelect) {
      this.container.querySelectorAll('[data-use-template-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.useTemplateId;
          const result = await workoutTemplateRepository.getById(id);
          if (result.success && this.onTemplateSelect) {
            this.onTemplateSelect(result.data);
          }
        });
      });
    }
  }

  async showTemplateForm(templateId = null) {
    let template = null;
    if (templateId) {
      const result = await workoutTemplateRepository.getById(templateId);
      if (result.success) {
        template = result.data;
      }
    }

    // Create form HTML
    const formContainer = document.createElement('div');
    const initialExercises = template?.exercises || [WorkoutTemplateModel.createExercise()];

    formContainer.innerHTML = `
      <form id="template-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="input-group">
          <label class="input-label" for="template-name">Template Name</label>
          <input id="template-name" class="input-field" type="text" placeholder="e.g., Upper Body Strength" value="${template?.name || ''}" required>
        </div>

        <div class="input-group">
          <label class="input-label" for="template-category">Category</label>
          <select id="template-category" class="input-field" required>
            <option value="Push" ${template?.category === 'Push' ? 'selected' : ''}>Push</option>
            <option value="Pull" ${template?.category === 'Pull' ? 'selected' : ''}>Pull</option>
            <option value="Legs" ${template?.category === 'Legs' ? 'selected' : ''}>Legs</option>
            <option value="Upper" ${template?.category === 'Upper' ? 'selected' : ''}>Upper</option>
            <option value="Lower" ${template?.category === 'Lower' ? 'selected' : ''}>Lower</option>
            <option value="Full Body" ${template?.category === 'Full Body' ? 'selected' : ''}>Full Body</option>
            <option value="Custom" ${!template || template?.category === 'Custom' ? 'selected' : ''}>Custom</option>
          </select>
        </div>

        <div id="exercises-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="input-label" style="margin: 0;">Exercises</label>
            <button type="button" class="btn btn-sm" id="add-exercise-btn">${getIcon('plus')} Add Exercise</button>
          </div>
          <div id="exercises-list" style="display: flex; flex-direction: column; gap: 12px;">
            ${initialExercises.map((ex, index) => this.renderExerciseForm(index, ex)).join('')}
          </div>
        </div>
      </form>
    `;

    showModal({
      title: template ? 'Edit Template' : 'Create Template',
      content: formContainer,
      actions: [
        { id: 'cancel', label: 'Cancel', className: 'btn', onClick: hideModal },
        { id: 'save', label: 'Save', className: 'btn btn-primary' }
      ]
    });

    // Attach form listeners
    requestAnimationFrame(() => {
      const exercisesList = document.getElementById('exercises-list');
      const addExerciseBtn = document.getElementById('add-exercise-btn');
      if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
          const newIndex = exercisesList.children.length;
          const newExercise = WorkoutTemplateModel.createExercise();
          const exerciseEl = document.createElement('div');
          exerciseEl.innerHTML = this.renderExerciseForm(newIndex, newExercise);
          exercisesList.appendChild(exerciseEl.firstElementChild);
          this.attachExerciseListeners(exerciseEl.firstElementChild, newIndex);
        });
      }

      // Attach listeners to existing exercise forms
      exercisesList.querySelectorAll('.exercise-form').forEach((el, index) => {
        this.attachExerciseListeners(el, index);
      });

      // Save button
      const saveBtn = document.querySelector('[data-action="save"]');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          const name = document.getElementById('template-name').value.trim();
          const category = document.getElementById('template-category').value;

          // Collect exercises
          const exercises = [];
          const exerciseForms = document.querySelectorAll('.exercise-form');
          exerciseForms.forEach((el, index) => {
            exercises.push({
              id: el.dataset.exerciseId || WorkoutTemplateModel.createExercise().id,
              name: el.querySelector('.exercise-name').value.trim(),
              targetMuscle: el.querySelector('.exercise-target').value.trim(),
              sets: parseInt(el.querySelector('.exercise-sets').value) || 3,
              repsTarget: parseInt(el.querySelector('.exercise-reps').value) || 10,
              restTime: parseInt(el.querySelector('.exercise-rest').value) || 90,
              notes: el.querySelector('.exercise-notes').value.trim()
            });
          });

          // Save
          const saveResult = await workoutTemplateRepository.save({
            id: template?.id || null,
            name,
            category,
            exercises
          });

          if (saveResult.success) {
            hideModal();
          } else {
            alert(saveResult.error);
          }
        });
      }
    });
  }

  renderExerciseForm(index, exercise) {
    return `
      <div class="exercise-form" data-exercise-id="${exercise.id}" style="border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; background: var(--color-card-hover);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 600;">Exercise ${index + 1}</span>
          <button type="button" class="btn btn-icon btn-sm remove-exercise-btn" title="Remove Exercise">✖️</button>
        </div>
        <div class="input-group" style="margin-bottom: 8px;">
          <label class="input-label" style="margin-bottom: 4px;">Name</label>
          <input class="input-field exercise-name" type="text" placeholder="e.g., Bench Press" value="${exercise.name || ''}">
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
          <div class="input-group">
            <label class="input-label" style="margin-bottom: 4px;">Target Muscle</label>
            <input class="input-field exercise-target" type="text" placeholder="e.g., Chest" value="${exercise.targetMuscle || ''}">
          </div>
          <div class="input-group">
            <label class="input-label" style="margin-bottom: 4px;">Sets</label>
            <input class="input-field exercise-sets" type="number" min="1" value="${exercise.sets || 3}">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px;">
          <div class="input-group">
            <label class="input-label" style="margin-bottom: 4px;">Reps Target</label>
            <input class="input-field exercise-reps" type="number" min="1" value="${exercise.repsTarget || 10}">
          </div>
          <div class="input-group">
            <label class="input-label" style="margin-bottom: 4px;">Rest Time (sec)</label>
            <input class="input-field exercise-rest" type="number" min="0" value="${exercise.restTime || 90}">
          </div>
        </div>
        <div class="input-group">
          <label class="input-label" style="margin-bottom: 4px;">Notes</label>
          <textarea class="input-field exercise-notes" rows="2" placeholder="Add notes...">${exercise.notes || ''}</textarea>
        </div>
      </div>
    `;
  }

  attachExerciseListeners(el, index) {
    const removeBtn = el.querySelector('.remove-exercise-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.exercise-form').length > 1) {
          el.remove();
        } else {
          alert('At least one exercise is required.');
        }
      });
    }
  }

  async loadData() {
    const result = await workoutTemplateRepository.getAll();
    const templates = result.success ? result.data : [];
    return { templates };
  }
}
