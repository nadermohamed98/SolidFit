
/**
 * Settings Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import { generateId } from '../utils/idGenerator.js';

class SettingsRepository extends BaseRepository {
  constructor() {
    super('settings');
  }

  /**
   * Get settings
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async getSettings() {
    const result = await this.getAll();
    if (!result.success) {
      return result;
    }
    if (result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: true, data: null };
  }

  /**
   * Save settings
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async saveSettings(data) {
    const current = await this.getSettings();
    const settings = {
      id: current.data?.id || generateId(),
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.save(settings);
  }
}

const settingsRepository = new SettingsRepository();
export default settingsRepository;

