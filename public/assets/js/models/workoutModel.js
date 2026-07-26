
/**
 * Workout Model
 * Represents workout log entries (sessions)
 */

import { generateId, isValidId } from '../utils/idGenerator.js';
import { validateRequired, validateString, validateNumber, validateDate, validateArray, validateObject } from '../utils/validator.js';
import { toISOString, toDateString } from '../utils/date.js';

const WorkoutModel = {
  /**
   * Create a new workout object
   * @param {object} data
   * @returns {object} workout
   */
  create(data) {
    return {
      id: data.id || generateId(),
      date: data.date || toDateString(),
      templateId: data.templateId || null,
      name: data.name || '',
      type: data.type || 'strength', // strength, cardio, yoga, other
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      completed: typeof data.completed === 'boolean' ? data.completed : Boolean(data.endTime),
      duration: data.duration || 0, // in minutes
      exercises: data.exercises || [], // Array of { exerciseId, name, sets: [{ weight, reps, rpe, completedAt }] }
      summary: data.summary || {}, // { exercisesCompleted, totalSets, estimatedVolume, averageRPE, notes, shoulderPain, kneePain, overallFeeling }
      notes: data.notes || '',
      createdAt: data.createdAt || toISOString(),
      updatedAt: toISOString()
    };
  },

  /**
   * Create a workout session from a template
   * @param {object} template
   * @returns {object} workout
   */
  createFromTemplate(template) {
    return this.create({
      templateId: template.id,
      name: template.name,
      type: template.category,
      exercises: template.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: [],
        setsTarget: ex.sets,
        repsTarget: ex.repsTarget,
        restTime: ex.restTime,
        notes: ex.notes
      }))
    });
  },

  /**
   * Calculate workout summary
   * @param {object} workout
   * @returns {object} summary
   */
  calculateSummary(workout) {
    let exercisesCompleted = 0;
    let totalSets = 0;
    let totalWeight = 0; // For estimated volume
    let totalReps = 0;
    let totalRPE = 0;
    let rpeCount = 0;

    workout.exercises.forEach(ex => {
      if (ex.sets.length > 0) {
        exercisesCompleted++;
      }
      ex.sets.forEach(set => {
        totalSets++;
        if (set.weight && set.reps) {
          totalWeight += set.weight * set.reps;
        }
        totalReps += set.reps || 0;
        if (set.rpe && set.rpe > 0 && set.rpe <= 10) {
          totalRPE += set.rpe;
          rpeCount++;
        }
      });
    });

    const estimatedVolume = totalWeight;
    const averageRPE = rpeCount > 0 ? totalRPE / rpeCount : 0;

    return {
      exercisesCompleted,
      totalSets,
      estimatedVolume,
      averageRPE: parseFloat(averageRPE.toFixed(1)),
      notes: workout.summary?.notes || '',
      shoulderPain: workout.summary?.shoulderPain || 0,
      kneePain: workout.summary?.kneePain || 0,
      overallFeeling: workout.summary?.overallFeeling || ''
    };
  },

  /**
   * Validate workout data
   * @param {object} workout
   * @returns {object} { success: boolean, error?: string, data?: object }
   */
  validate(workout) {
    // Validate ID
    if (workout.id) {
      if (!isValidId(workout.id)) {
        return { success: false, error: 'Invalid workout ID' };
      }
    }

    // Validate date
    const dateValidation = validateRequired(workout.date, 'Date');
    if (!dateValidation.valid) {
      return { success: false, error: dateValidation.error };
    }

    // Validate name
    const nameValidation = validateString(workout.name, 'Name', { maxLength: 100 });
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    // Validate type
    const typeValidation = validateString(workout.type, 'Type', { maxLength: 50 });
    if (!typeValidation.valid) {
      return { success: false, error: typeValidation.error };
    }

    // Validate duration
    if (workout.duration !== null && workout.duration !== undefined) {
      const durationValidation = validateNumber(workout.duration, 'Duration', { min: 0 });
      if (!durationValidation.valid) {
        return { success: false, error: durationValidation.error };
      }
    }

    // Validate exercises
    const exercisesValidation = validateArray(workout.exercises, 'Exercises');
    if (!exercisesValidation.valid) {
      return { success: false, error: exercisesValidation.error };
    }

    // Validate summary
    if (workout.summary) {
      const summaryValidation = validateObject(workout.summary, 'Summary');
      if (!summaryValidation.valid) {
        return { success: false, error: summaryValidation.error };
      }
    }

    // Validate notes
    const notesValidation = validateString(workout.notes, 'Notes', { maxLength: 2000 });
    if (!notesValidation.valid) {
      return { success: false, error: notesValidation.error };
    }

    // Validate dates
    if (workout.createdAt) {
      const createdAtValidation = validateDate(workout.createdAt, 'Created at');
      if (!createdAtValidation.valid) {
        return { success: false, error: createdAtValidation.error };
      }
    }

    return { success: true, data: workout };
  },
};

export default WorkoutModel;
