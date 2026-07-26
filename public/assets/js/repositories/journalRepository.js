
/**
 * Journal Repository
 */

import { BaseRepository } from '../storage/storageManager.js';
import JournalModel from '../models/journalModel.js';

class JournalRepository extends BaseRepository {
  constructor() {
    super('journal');
  }

  /**
   * Save journal
   * @param {object} data
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async save(data) {
    const journal = JournalModel.create(data);
    const validation = JournalModel.validate(journal);
    if (!validation.success) {
      return validation;
    }
    return super.save(validation.data);
  }
}

const journalRepository = new JournalRepository();
export default journalRepository;

