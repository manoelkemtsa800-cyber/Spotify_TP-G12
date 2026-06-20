import {supabase} from '../config/supabase';
import {Track} from '../types';

export async function getRecommendations(
  userId: string,
  limit: number = 20,
): Promise<Track[]> {
  const {data: history} = await supabase
    .from('listening_history')
    .select('track_id, tracks(artist)')
    .eq('user_id', userId)
    .order('listened_at', {ascending: false})
    .limit(100);

  if (!history || history.length === 0) return getPopularTracks(limit);

  const listenedIds = new Set(history.map((h: any) => h.track_id));
  const artistCounts: Record<string, number> = {};
  history.forEach((h: any) => {
    const artist = h.tracks?.artist;
    if (artist) artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });

  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([artist]) => artist);

  if (topArtists.length === 0) return getPopularTracks(limit);

  const {data: candidates} = await supabase
    .from('tracks')
    .select('*')
    .in('artist', topArtists)
    .limit(limit * 2);

  if (!candidates) return getPopularTracks(limit);
  return candidates
    .filter((t: Track) => !listenedIds.has(t.id))
    .slice(0, limit);
}

async function getPopularTracks(limit: number): Promise<Track[]> {
  const {data} = await supabase
    .from('listening_history')
    .select('track_id, tracks(*)')
    .limit(500);

  if (!data) return [];
  const counts: Record<string, {track: Track; count: number}> = {};
  data.forEach((row: any) => {
    if (!row.tracks) return;
    const id = row.track_id;
    if (!counts[id]) counts[id] = {track: row.tracks, count: 0};
    counts[id].count++;
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(e => e.track);
}
