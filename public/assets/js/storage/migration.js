
/**
 * Database Migrations
 * Handles upgrading database between versions
 */

import { DB_SCHEMA } from './schema.js';

/**
 * Run migrations for a given database
 * @param {IDBDatabase} db
 * @param {number} oldVersion
 * @param {number} newVersion
 * @param {IDBTransaction} [transaction]
 */
export function runMigrations(db, oldVersion, newVersion, transaction) {
  // Handle version 1 (initial schema)
  if (oldVersion < 1) {
    createStoresFromSchema(db);
  }

  // Handle version 2 (add workoutTemplates store and update workouts index)
  if (oldVersion < 2) {
    // Add workoutTemplates store if not exists
    if (!db.objectStoreNames.contains('workoutTemplates')) {
      const templateStore = db.createObjectStore('workoutTemplates', {
        keyPath: 'id'
      });
      templateStore.createIndex('category', 'category', { unique: false });
    }
    // Update workouts store to add templateId index if not exists
    if (db.objectStoreNames.contains('workouts') && transaction) {
      const workoutStore = transaction.objectStore('workouts');
      if (!workoutStore.indexNames.contains('templateId')) {
        workoutStore.createIndex('templateId', 'templateId', { unique: false });
      }
    }
  }

  // Future migrations can be added here
}

/**
 * Create all object stores from schema
 * @param {IDBDatabase} db
 */
function createStoresFromSchema(db) {
  DB_SCHEMA.stores.forEach(storeConfig => {
    if (!db.objectStoreNames.contains(storeConfig.name)) {
      const store = db.createObjectStore(storeConfig.name, {
        keyPath: storeConfig.keyPath
      });
      // Create indexes
      storeConfig.indexes.forEach(indexConfig => {
        store.createIndex(indexConfig.name, indexConfig.keyPath, {
          unique: indexConfig.unique
        });
      });
    }
  });
}
