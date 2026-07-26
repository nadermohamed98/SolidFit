
/**
 * Nutrition Model
 * Represents daily nutrition log (one per day)
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateNumber, validateDate, validateArray, validateObject } from '../utils/validator.js';
import { toISOString, toDateString } from '../utils/date.js';

const NutritionModel = {
  /**
   * Create a new daily nutrition document
   * @param {object} data
   * @returns {object}
   */
  create(data) {
    return {
      id: data.id || generateId(),
      date: data.date || toDateString(),
      meals: data.meals || [],
      totals: this.calculateTotals(data.meals || []),
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Calculate daily totals from meals array
   * @param {Array} meals
   * @returns {object}
   */
  calculateTotals(meals) {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      water: 0
    };

    meals.forEach(meal => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      totals.fiber += meal.fiber || 0;
      totals.water += meal.water || 0;
    });

    return totals;
  },

  /**
   * Create a new meal object
   * @param {object} data
   * @returns {object}
   */
  createMeal(data) {
    return {
      id: data.id || generateId(),
      mealName: data.mealName || 'Meal',
      time: data.time || new Date().toTimeString().slice(0, 5),
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0,
      water: data.water || 0,
      notes: data.notes || '',
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Validate a meal object
   * @param {object} meal
   * @returns {object}
   */
  validateMeal(meal) {
    // Validate ID
    if (meal.id) {
      if (!isValidId(meal.id)) {
        return { success: false, error: 'Invalid meal ID' };
      }
    }

    // Validate meal name
    const nameValidation = validateString(meal.mealName, 'Meal Name', { maxLength: 100 });
    if (!nameValidation.valid) {
      return nameValidation;
    }

    // Validate time
    const timeValidation = validateString(meal.time, 'Time', { minLength: 5, maxLength: 5 });
    if (!timeValidation.valid) {
      return timeValidation;
    }

    // Validate macros
    const numberFields = [
      { key: 'calories', name: 'Calories', min: 0 },
      { key: 'protein', name: 'Protein', min: 0 },
      { key: 'carbs', name: 'Carbs', min: 0 },
      { key: 'fat', name: 'Fat', min: 0 },
      { key: 'fiber', name: 'Fiber', min: 0 },
      { key: 'water', name: 'Water', min: 0 }
    ];

    for (const field of numberFields) {
      const validation = validateNumber(meal[field.key], field.name, { min: field.min });
      if (!validation.valid) {
        return validation;
      }
    }

    // Validate notes
    const notesValidation = validateString(meal.notes, 'Notes', { maxLength: 500 });
    if (!notesValidation.valid) {
      return notesValidation;
    }

    return { success: true, data: meal };
  },

  /**
   * Validate daily nutrition document
   * @param {object} nutrition
   * @returns {object}
   */
  validate(nutrition) {
    if (nutrition.id && !isValidId(nutrition.id)) {
      return { success: false, error: 'Invalid nutrition ID' };
    }

    const dateValidation = validateRequired(nutrition.date, 'Date');
    if (!dateValidation.valid) {
      return dateValidation;
    }

    const mealsValidation = validateArray(nutrition.meals, 'Meals');
    if (!mealsValidation.valid) {
      return mealsValidation;
    }

    // Validate each meal
    for (const meal of nutrition.meals) {
      const mealValidation = this.validateMeal(meal);
      if (!mealValidation.success) {
        return mealValidation;
      }
    }

    return { success: true, data: nutrition };
  }
};

export default NutritionModel;

