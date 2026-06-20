import RNFS from 'react-native-fs';
import {getDB} from '../database/db';
import {Track, DownloadedTrack} from '../types';

const TRACKS_DIR = `${RNFS.DocumentDirectoryPath}/offline_tracks`;

async function ensureDir() {
  const exists = await RNFS.exists(TRACKS_DIR);
  if (!exists) await RNFS.mkdir(TRACKS_DIR);
}

export async function downloadTrackForOffline(
  track: Track,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await ensureDir();
  const ext = track.audio_url.split('.').pop()?.split('?')[0] || 'mp3';
  const localAudioPath = `${TRACKS_DIR}/${track.id}.${ext}`;

  const dl = RNFS.downloadFile({
    fromUrl: track.audio_url,
    toFile: localAudioPath,
    progress: res => {
      if (onProgress && res.contentLength > 0) {
        onProgress(Math.round((res.bytesWritten / res.contentLength) * 100));
      }
    },
    progressDivider: 5,
  });

  const result = await dl.promise;
  if (result.statusCode !== 200) {
    throw new Error(`Échec téléchargement (code ${result.statusCode})`);
  }

  let localCoverPath: string | null = null;
  if (track.cover_url) {
    try {
      localCoverPath = `${TRACKS_DIR}/${track.id}_cover.jpg`;
      await RNFS.downloadFile({fromUrl: track.cover_url, toFile: localCoverPath}).promise;
    } catch {
      localCoverPath = null;
    }
  }

  const db = getDB();
  db.execute(
    `INSERT OR REPLACE INTO downloaded_tracks
     (track_id, title, artist, album, duration_seconds, cover_local_path, audio_local_path, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      track.id, track.title, track.artist, track.album,
      track.duration_seconds, localCoverPath, localAudioPath,
      new Date().toISOString(),
    ],
  );
}

export async function removeDownloadedTrack(trackId: string): Promise<void> {
  const db = getDB();
  const result = db.execute(
    'SELECT audio_local_path, cover_local_path FROM downloaded_tracks WHERE track_id = ?',
    [trackId],
  );
  const row = result.rows?._array[0];
  if (row) {
    if (await RNFS.exists(row.audio_local_path)) await RNFS.unlink(row.audio_local_path);
    if (row.cover_local_path && await RNFS.exists(row.cover_local_path)) {
      await RNFS.unlink(row.cover_local_path);
    }
  }
  db.execute('DELETE FROM downloaded_tracks WHERE track_id = ?', [trackId]);
}

export async function getDownloadedTracks(): Promise<DownloadedTrack[]> {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM downloaded_tracks ORDER BY downloaded_at DESC',
  );
  return (result.rows?._array ?? []).map((row: any) => ({
    track_id: row.track_id,
    local_file_path: row.audio_local_path,
    downloaded_at: row.downloaded_at,
  }));
}

export async function getLocalPathIfDownloaded(trackId: string): Promise<string | null> {
  const db = getDB();
  const result = db.execute(
    'SELECT audio_local_path FROM downloaded_tracks WHERE track_id = ?',
    [trackId],
  );
  const rows = result.rows?._array ?? [];
  return rows.length > 0 ? rows[0].audio_local_path : null;
}

export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  return (await getLocalPathIfDownloaded(trackId)) !== null;
}
