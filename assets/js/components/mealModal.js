
/**
 * Meal Modal Component
 */

import { showModal, hideModal } from './modal.js';
import nutritionRepository from '../repositories/nutritionRepository.js';

let onMealSavedCallback = null;

/**
 * Show Add/Edit Meal Modal
 * @param {object} options
 */
export function showMealModal(options = {}) {
  const { meal = null, onSave = null } = options;
  onMealSavedCallback = onSave;

  const isEdit = !!meal;
  const title = isEdit ? 'Edit Meal' : 'Add Meal';

  const modalContent = document.createElement('div');
  modalContent.innerHTML = `
    <form id="meal-form" style="display: flex; flex-direction: column; gap: 16px;">
      <div class="input-group">
        <label class="input-label" for="meal-name">Meal Name</label>
        <input id="meal-name" class="input-field" type="text" placeholder="Breakfast, Lunch, Dinner..." value="${meal?.mealName || ''}" required>
      </div>
      <div class="input-group">
        <label class="input-label" for="meal-time">Time</label>
        <input id="meal-time" class="input-field" type="time" value="${meal?.time || new Date().toTimeString().slice(0, 5)}" required>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div class="input-group">
          <label class="input-label" for="meal-calories">Calories</label>
          <input id="meal-calories" class="input-field" type="number" min="0" value="${meal?.calories || 0}">
        </div>
        <div class="input-group">
          <label class="input-label" for="meal-protein">Protein (g)</label>
          <input id="meal-protein" class="input-field" type="number" min="0" step="0.1" value="${meal?.protein || 0}">
        </div>
        <div class="input-group">
          <label class="input-label" for="meal-carbs">Carbs (g)</label>
          <input id="meal-carbs" class="input-field" type="number" min="0" step="0.1" value="${meal?.carbs || 0}">
        </div>
        <div class="input-group">
          <label class="input-label" for="meal-fat">Fat (g)</label>
          <input id="meal-fat" class="input-field" type="number" min="0" step="0.1" value="${meal?.fat || 0}">
        </div>
        <div class="input-group">
          <label class="input-label" for="meal-fiber">Fiber (g)</label>
          <input id="meal-fiber" class="input-field" type="number" min="0" step="0.1" value="${meal?.fiber || 0}">
        </div>
        <div class="input-group">
          <label class="input-label" for="meal-water">Water (L)</label>
          <input id="meal-water" class="input-field" type="number" min="0" step="0.1" value="${meal?.water || 0}">
        </div>
      </div>

      <div class="input-group">
        <label class="input-label" for="meal-notes">Notes</label>
        <textarea id="meal-notes" class="input-field" placeholder="Add notes about this meal..." rows="3">${meal?.notes || ''}</textarea>
      </div>
    </form>
  `;

  showModal({
    title,
    content: modalContent,
    actions: [
      { id: 'cancel', label: 'Cancel', className: 'btn' },
      { id: 'save', label: 'Save', className: 'btn btn-primary' }
    ]
  });

  // Wait for modal to render
  requestAnimationFrame(() => {
    // Add action listeners
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const formData = {
          mealName: document.getElementById('meal-name').value.trim(),
          time: document.getElementById('meal-time').value,
          calories: parseFloat(document.getElementById('meal-calories').value) || 0,
          protein: parseFloat(document.getElementById('meal-protein').value) || 0,
          carbs: parseFloat(document.getElementById('meal-carbs').value) || 0,
          fat: parseFloat(document.getElementById('meal-fat').value) || 0,
          fiber: parseFloat(document.getElementById('meal-fiber').value) || 0,
          water: parseFloat(document.getElementById('meal-water').value) || 0,
          notes: document.getElementById('meal-notes').value.trim()
        };

        let result;
        if (isEdit && meal?.id) {
          result = await nutritionRepository.updateMeal(meal.id, formData);
        } else {
          result = await nutritionRepository.addMeal(formData);
        }

        if (result.success) {
          hideModal();
          if (onMealSavedCallback) {
            onMealSavedCallback();
          }
        } else {
          alert(result.error);
        }
      });
    }

    const cancelBtn = document.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', hideModal);
    }
  });
}

