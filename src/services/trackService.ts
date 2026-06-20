import {supabase} from '../config/supabase';
import {Track} from '../types';

const BUCKET_AUDIO = 'audio-tracks';
const BUCKET_COVERS = 'track-covers';

export async function fetchTracks(): Promise<Track[]> {
  const {data, error} = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data as Track[];
}

export async function searchTracks(query: string): Promise<Track[]> {
  const {data, error} = await supabase
    .from('tracks')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .limit(30);
  if (error) throw error;
  return data as Track[];
}

export async function uploadTrack(params: {
  fileUri: string;
  fileName: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds: number;
  ownerId: string;
  coverUri?: string;
}): Promise<Track> {
  const {fileUri, fileName, title, artist, album, durationSeconds, ownerId, coverUri} = params;

  const audioPath = `${ownerId}/${Date.now()}-${fileName}`;
  const audioBlob = await uriToBlob(fileUri);

  const {error: uploadError} = await supabase.storage
    .from(BUCKET_AUDIO)
    .upload(audioPath, audioBlob, {contentType: 'audio/mpeg'});
  if (uploadError) throw uploadError;

  const {data: audioUrlData} = supabase.storage
    .from(BUCKET_AUDIO)
    .getPublicUrl(audioPath);

  let coverUrl: string | null = null;
  if (coverUri) {
    try {
      const coverPath = `${ownerId}/${Date.now()}-cover.jpg`;
      const coverBlob = await uriToBlob(coverUri);
      await supabase.storage
        .from(BUCKET_COVERS)
        .upload(coverPath, coverBlob, {contentType: 'image/jpeg'});
      const {data: coverData} = supabase.storage
        .from(BUCKET_COVERS)
        .getPublicUrl(coverPath);
      coverUrl = coverData.publicUrl;
    } catch {}
  }

  const {data, error} = await supabase
    .from('tracks')
    .insert({
      title,
      artist,
      album: album ?? null,
      duration_seconds: durationSeconds,
      cover_url: coverUrl,
      audio_url: audioUrlData.publicUrl,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Track;
}

export async function deleteTrack(trackId: string): Promise<void> {
  const {error} = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) throw error;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return await response.blob();
}
