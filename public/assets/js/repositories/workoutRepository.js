
/**
 * Workout Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import WorkoutModel from '../models/workoutModel.js';
import { toDateString } from '../utils/date.js';

class WorkoutRepository extends BaseRepository {
  constructor() {
    super('workouts');
  }

  /**
   * Save workout
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async save(data) {
    const workout = WorkoutModel.create(data);
    const validation = WorkoutModel.validate(workout);
    if (!validation.success) {
      return validation;
    }
    return super.save(validation.data);
  }

  /**
   * Get workouts by date
   * @param {string} date
   * @returns {Promise<{ success: boolean, data?: object[], error?: string }>}
   */
  async getByDate(date = toDateString()) {
    const result = await super.getByDate(date);
    if (!result.success || !Array.isArray(result.data)) {
      return result;
    }
    const sorted = [...result.data].sort((a, b) => {
      if (Boolean(a.completed) !== Boolean(b.completed)) {
        return a.completed ? 1 : -1;
      }
      const aTime = new Date(a.updatedAt || a.createdAt || a.date);
      const bTime = new Date(b.updatedAt || b.createdAt || b.date);
      return bTime - aTime;
    });
    return { success: true, data: sorted };
  }

  /**
   * Create workout session from template
   * @param {object} template
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async createFromTemplate(template) {
    const workout = WorkoutModel.createFromTemplate(template);
    const validation = WorkoutModel.validate(workout);
    if (!validation.success) {
      return validation;
    }
    return super.save(validation.data);
  }
}

const workoutRepository = new WorkoutRepository();
export default workoutRepository;
