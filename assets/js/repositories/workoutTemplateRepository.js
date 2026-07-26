
/**
 * Workout Template Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import WorkoutTemplateModel from '../models/workoutTemplateModel.js';

class WorkoutTemplateRepository extends BaseRepository {
  constructor() {
    super('workoutTemplates');
  }

  /**
   * Save template
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async save(data) {
    const template = WorkoutTemplateModel.create(data);
    const validation = WorkoutTemplateModel.validate(template);
    if (!validation.success) {
      return validation;
    }
    return super.save(validation.data);
  }

  /**
   * Duplicate a template
   * @param {string} id
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async duplicate(id) {
    const result = await this.getById(id);
    if (!result.success) {
      return result;
    }
    const duplicated = WorkoutTemplateModel.duplicate(result.data);
    return this.save(duplicated);
  }
}

const workoutTemplateRepository = new WorkoutTemplateRepository();
export default workoutTemplateRepository;
