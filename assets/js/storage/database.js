
/**
 * Database Connection Manager
 * Handles opening/closing IndexedDB connections
 */

import { DB_SCHEMA } from './schema.js';
import { runMigrations } from './migration.js';

let dbInstance = null;

/**
 * Open the database
 * @returns {Promise<IDBDatabase>}
 */
export async function openDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_SCHEMA.dbName, DB_SCHEMA.version);

    request.onerror = () => {
      console.error('Error opening database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;
      runMigrations(db, oldVersion, newVersion, event.target.transaction);
    };
  });
}

/**
 * Close the database
 */
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Get database instance (opens if not open)
 * @returns {Promise<IDBDatabase>}
 */
export async function getDB() {
  return openDB();
}
