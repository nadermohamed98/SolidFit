
/**
 * Workout Template Model
 * Represents workout templates
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateArray } from '../utils/validator.js';
import { toISOString } from '../utils/date.js';

const WorkoutTemplateModel = {
  /**
   * Create a new workout template object
   * @param {object} data
   * @returns {object} template
   */
  create(data) {
    return {
      id: data.id || generateId(),
      name: data.name || '',
      category: data.category || 'Custom', // Push, Pull, Legs, Upper, Lower, Full Body, Custom
      exercises: data.exercises || [],
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Validate workout template data
   * @param {object} template
   * @returns {object} { success: boolean, error?: string, data?: object }
   */
  validate(template) {
    // Validate ID
    if (template.id) {
      if (!isValidId(template.id)) {
        return { success: false, error: 'Invalid template ID' };
      }
    }

    // Validate name
    const nameValidation = validateRequired(template.name, 'Template Name');
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }
    const nameLengthValidation = validateString(template.name, 'Template Name', { maxLength: 100 });
    if (!nameLengthValidation.valid) {
      return { success: false, error: nameLengthValidation.error };
    }

    // Validate category
    const categoryValidation = validateRequired(template.category, 'Category');
    if (!categoryValidation.valid) {
      return { success: false, error: categoryValidation.error };
    }

    // Validate exercises
    const exercisesValidation = validateArray(template.exercises, 'Exercises');
    if (!exercisesValidation.valid) {
      return { success: false, error: exercisesValidation.error };
    }

    // Validate each exercise
    for (let i = 0; i < template.exercises.length; i++) {
      const exercise = template.exercises[i];
      const exerciseNameValidation = validateRequired(exercise.name, `Exercise ${i + 1} Name`);
      if (!exerciseNameValidation.valid) {
        return { success: false, error: exerciseNameValidation.error };
      }
    }

    return { success: true, data: template };
  },

  /**
   * Create a default exercise object
   * @returns {object} exercise
   */
  createExercise() {
    return {
      id: generateId(),
      name: '',
      targetMuscle: '',
      sets: 3,
      repsTarget: 10,
      restTime: 90, // in seconds
      notes: ''
    };
  },

  /**
   * Duplicate a template
   * @param {object} template
   * @returns {object} duplicated template
   */
  duplicate(template) {
    return this.create({
      name: `${template.name} (Copy)`,
      category: template.category,
      exercises: template.exercises.map(ex => ({ ...ex, id: generateId() }))
    });
  }
};

export default WorkoutTemplateModel;
