import {getDB} from '../database/db';
import {supabase} from '../config/supabase';

export type SyncActionType =
  | 'add_listening_history'
  | 'create_playlist'
  | 'add_track_to_playlist';

export async function queueSyncAction(
  actionType: SyncActionType,
  payload: object,
): Promise<void> {
  const db = getDB();
  await db.execute(
    'INSERT INTO sync_queue (action_type, payload, created_at) VALUES (?, ?, ?)',
    [actionType, JSON.stringify(payload), new Date().toISOString()],
  );
}

export async function processSyncQueue(): Promise<{success: number; failed: number}> {
  const db = getDB();
  const result = await db.execute('SELECT * FROM sync_queue ORDER BY created_at ASC');
  const rows = result.rows ?? [];
  let success = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await executeAction(row.action_type as string, JSON.parse(row.payload as string));
      await db.execute('DELETE FROM sync_queue WHERE id = ?', [row.id]);
      success++;
    } catch {
      failed++;
    }
  }
  return {success, failed};
}

async function executeAction(actionType: string, payload: any): Promise<void> {
  switch (actionType) {
    case 'add_listening_history':
      await supabase.from('listening_history').insert({
        user_id: payload.userId,
        track_id: payload.trackId,
      });
      break;
    case 'create_playlist':
      await supabase.from('playlists').insert({
        id: payload.id,
        name: payload.name,
        owner_id: payload.ownerId,
        is_public: payload.isPublic ?? false,
      });
      break;
    case 'add_track_to_playlist':
      await supabase.from('playlist_tracks').insert({
        playlist_id: payload.playlistId,
        track_id: payload.trackId,
        position: payload.position ?? 0,
      });
      break;
    default:
      throw new Error(`Action inconnue: ${actionType}`);
  }
}
