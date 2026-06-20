import {open, DB} from '@op-engineering/op-sqlite';

let dbInstance: DB | null = null;

export function getDB(): DB {
  if (dbInstance) return dbInstance;
  dbInstance = open({name: 'spotify_clone.db'});
  createTables(dbInstance);
  return dbInstance;
}

function createTables(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS downloaded_tracks (
      track_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration_seconds INTEGER,
      cover_local_path TEXT,
      audio_local_path TEXT NOT NULL,
      downloaded_at TEXT NOT NULL
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
