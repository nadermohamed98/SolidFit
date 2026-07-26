
/**
 * Progress Repository (for measurements)
 */

import { BaseRepository } from '../storage/storageManager.js';

class ProgressRepository extends BaseRepository {
  constructor() {
    super('measurements');
  }
}

const progressRepository = new ProgressRepository();
export default progressRepository;

