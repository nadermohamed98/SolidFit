
/**
 * Profile Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import ProfileModel from '../models/profileModel.js';
import settingsRepository from './settingsRepository.js';

class ProfileRepository extends BaseRepository {
  constructor() {
    super('profile');
  }

  /**
   * Save profile
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async save(data) {
    const currentProfileResult = await this.getProfile();
    const currentProfile = currentProfileResult.success ? currentProfileResult.data : null;

    const profile = ProfileModel.create({
      ...currentProfile,
      ...data
    });
    const validation = ProfileModel.validate(profile);
    if (!validation.success) {
      return validation;
    }

    const mergedProfile = {
      ...currentProfile,
      ...validation.data,
      caloriesGoal: data.caloriesGoal ?? currentProfile?.caloriesGoal ?? null,
      proteinGoal: data.proteinGoal ?? currentProfile?.proteinGoal ?? null,
      carbsGoal: data.carbsGoal ?? currentProfile?.carbsGoal ?? null,
      fatGoal: data.fatGoal ?? currentProfile?.fatGoal ?? null,
      waterGoal: data.waterGoal ?? currentProfile?.waterGoal ?? null
    };

    const saveResult = await super.save(mergedProfile);
    if (!saveResult.success) {
      return saveResult;
    }

    const settingsResult = await settingsRepository.getSettings();
    const currentSettings = settingsResult.success ? settingsResult.data : null;

    await settingsRepository.saveSettings({
      ...currentSettings,
      caloriesGoal: mergedProfile.caloriesGoal,
      proteinGoal: mergedProfile.proteinGoal,
      carbsGoal: mergedProfile.carbsGoal,
      fatGoal: mergedProfile.fatGoal,
      waterGoal: mergedProfile.waterGoal
    });

    return saveResult;
  }

  /**
   * Get profile (should only be one)
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async getProfile() {
    const result = await this.getAll();
    if (!result.success) {
      return result;
    }
    if (result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: true, data: null };
  }
}

const profileRepository = new ProfileRepository();
export default profileRepository;
