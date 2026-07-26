/**
 * Check-In Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import CheckInModel, { CHECK_IN_NAME } from '../models/checkInModel.js';
import settingsRepository from './settingsRepository.js';
import journalRepository from './journalRepository.js';
import { toDateString } from '../utils/date.js';

class CheckInRepository extends BaseRepository {
  constructor() {
    super('habits');
  }

  /**
   * Save check-in for the given day and sync compatibility fields
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async save(data) {
    let existingCheckIn = null;
    if (!data.id) {
      const existingResult = await this.getByDate(data.date || toDateString());
      if (existingResult.success && existingResult.data) {
        existingCheckIn = existingResult.data;
      }
    }

    const checkIn = CheckInModel.create({
      ...data,
      id: data.id || existingCheckIn?.id,
      createdAt: data.createdAt || existingCheckIn?.createdAt
    });
    const validation = CheckInModel.validate(checkIn);
    if (!validation.success) {
      return validation;
    }

    const saveResult = await super.save(validation.data);
    if (!saveResult.success) {
      return saveResult;
    }

    if (validation.data.date === toDateString()) {
      await this.syncRecoverySources(validation.data);
    }
    return saveResult;
  }

  /**
   * Get today's check-in
   * @param {string} date
   * @returns {Promise<{ success: boolean, data?: object|null, error?: string }>}
   */
  async getByDate(date = toDateString()) {
    const result = await super.getByDate(date);
    if (!result.success) {
      return result;
    }

    const checkIn = result.data.find(item => item.name === CHECK_IN_NAME) || null;
    return { success: true, data: checkIn };
  }

  /**
   * Get all check-ins, newest first
   * @returns {Promise<{ success: boolean, data?: object[], error?: string }>}
   */
  async getAllCheckIns() {
    const result = await super.getAll();
    if (!result.success) {
      return result;
    }

    const checkIns = result.data
      .filter(item => item.name === CHECK_IN_NAME)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, data: checkIns };
  }

  /**
   * Clear today's check-in
   * @param {string} date
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async clearByDate(date = toDateString()) {
    const result = await this.getByDate(date);
    if (!result.success || !result.data) {
      return result.success ? { success: true } : result;
    }

    const deleteResult = await super.delete(result.data.id);
    if (!deleteResult.success) {
      return deleteResult;
    }

    if (date === toDateString()) {
      await this.clearRecoverySources(date);
    }

    return deleteResult;
  }

  /**
   * Mirror required values into existing repositories so current widgets pick them up
   * @param {object} checkIn
   * @returns {Promise<void>}
   */
  async syncRecoverySources(checkIn) {
    const derivedMood = CheckInModel.getDerivedMood(checkIn);
    const painLevel = CheckInModel.getDerivedPainLevel(checkIn);

    await settingsRepository.saveSettings({
      sleepHours: checkIn.sleepHours,
      painLevel
    });

    const journalResult = await journalRepository.getByDate(checkIn.date);
    const todayEntries = journalResult.success ? journalResult.data : [];
    const existingCheckInEntry = todayEntries.find(entry => typeof entry.content === 'string' && entry.content.startsWith('[Check-in]'));

    const journalPayload = {
      id: existingCheckInEntry?.id,
      date: checkIn.date,
      createdAt: existingCheckInEntry?.createdAt,
      mood: derivedMood,
      content: `[Check-in] ${checkIn.notes || 'Daily check-in completed.'}`,
      tags: ['check-in', 'recovery']
    };

    await journalRepository.save(journalPayload);
  }

  /**
   * Remove mirrored values for today's check-in
   * @param {string} date
   * @returns {Promise<void>}
   */
  async clearRecoverySources(date) {
    await settingsRepository.saveSettings({
      sleepHours: 7,
      painLevel: 3
    });

    const journalResult = await journalRepository.getByDate(date);
    const todayEntries = journalResult.success ? journalResult.data : [];
    const existingCheckInEntry = todayEntries.find(entry => typeof entry.content === 'string' && entry.content.startsWith('[Check-in]'));

    if (existingCheckInEntry) {
      await journalRepository.delete(existingCheckInEntry.id);
    }
  }
}

const checkInRepository = new CheckInRepository();
export default checkInRepository;
