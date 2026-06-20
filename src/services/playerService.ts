import TrackPlayer, {
  Capability,
  RepeatMode,
  AppKilledPlaybackBehavior,
  State,
} from 'react-native-track-player';
import {Track} from '../types';

let isSetup = false;

export async function setupPlayer(): Promise<void> {
  if (isSetup) return;
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  isSetup = true;
}

function toPlayerTrack(track: Track, localPath?: string) {
  return {
    id: track.id,
    url: localPath ?? track.audio_url,
    title: track.title,
    artist: track.artist,
    artwork: track.cover_url ?? undefined,
    duration: track.duration_seconds,
  };
}

export async function playQueue(
  tracks: Track[],
  startIndex: number = 0,
  localPaths: Record<string, string> = {},
): Promise<void> {
  await TrackPlayer.reset();
  const playerTracks = tracks.map(t => toPlayerTrack(t, localPaths[t.id]));
  await TrackPlayer.add(playerTracks);
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
}

export async function togglePlayback(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function skipToNext(): Promise<void> {
  await TrackPlayer.skipToNext().catch(() => {});
}

export async function skipToPrevious(): Promise<void> {
  await TrackPlayer.skipToPrevious().catch(() => {});
}

export default TrackPlayer;
