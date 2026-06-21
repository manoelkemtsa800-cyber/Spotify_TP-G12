import Sound from 'react-native-sound';
import {Track} from '../types';

Sound.setCategory('Playback');

let currentSound: Sound | null = null;
let currentQueue: Track[] = [];
let currentIndex = 0;
let currentLocalPaths: Record<string, string> = {};

type StateListener = (isPlaying: boolean) => void;
type TrackChangeListener = (track: Track | null, index: number) => void;

const stateListeners: StateListener[] = [];
const trackChangeListeners: TrackChangeListener[] = [];

export function onPlaybackStateChange(cb: StateListener) {
  stateListeners.push(cb);
  return () => {
    const i = stateListeners.indexOf(cb);
    if (i >= 0) stateListeners.splice(i, 1);
  };
}

export function onTrackChange(cb: TrackChangeListener) {
  trackChangeListeners.push(cb);
  return () => {
    const i = trackChangeListeners.indexOf(cb);
    if (i >= 0) trackChangeListeners.splice(i, 1);
  };
}

function notifyState(isPlaying: boolean) {
  stateListeners.forEach(cb => cb(isPlaying));
}

function notifyTrackChange(track: Track | null, index: number) {
  trackChangeListeners.forEach(cb => cb(track, index));
}

export async function setupPlayer(): Promise<void> {
  // react-native-sound n'a pas besoin d'initialisation asynchrone particuliere.
  return Promise.resolve();
}

function loadAndPlay(track: Track, localPath?: string) {
  if (currentSound) {
    currentSound.stop();
    currentSound.release();
    currentSound = null;
  }

  const url = localPath ?? track.audio_url;
  const isLocal = !!localPath;

  currentSound = new Sound(
    url,
    isLocal ? undefined : Sound.MAIN_BUNDLE,
    error => {
      if (error) {
        console.error('Erreur chargement piste:', error);
        notifyState(false);
        return;
      }
      currentSound?.play(success => {
        if (!success) {
          console.error('Erreur lecture piste');
        }
        notifyState(false);
        skipToNext();
      });
      notifyState(true);
    },
  );
}

export async function playQueue(
  tracks: Track[],
  startIndex: number = 0,
  localPaths: Record<string, string> = {},
): Promise<void> {
  currentQueue = tracks;
  currentIndex = startIndex;
  currentLocalPaths = localPaths;

  const track = currentQueue[currentIndex];
  if (!track) return;

  loadAndPlay(track, currentLocalPaths[track.id]);
  notifyTrackChange(track, currentIndex);
}

export async function togglePlayback(): Promise<void> {
  if (!currentSound) return;
  currentSound.isPlaying(playing => {
    if (playing) {
      currentSound?.pause();
      notifyState(false);
    } else {
      currentSound?.play(success => {
        if (!success) console.error('Erreur lecture piste');
        notifyState(false);
      });
      notifyState(true);
    }
  });
}

export async function skipToNext(): Promise<void> {
  if (currentIndex < currentQueue.length - 1) {
    currentIndex += 1;
    const track = currentQueue[currentIndex];
    loadAndPlay(track, currentLocalPaths[track.id]);
    notifyTrackChange(track, currentIndex);
  }
}

export async function skipToPrevious(): Promise<void> {
  if (currentIndex > 0) {
    currentIndex -= 1;
    const track = currentQueue[currentIndex];
    loadAndPlay(track, currentLocalPaths[track.id]);
    notifyTrackChange(track, currentIndex);
  }
}

export function seekTo(seconds: number): void {
  currentSound?.setCurrentTime(seconds);
}

export function getProgress(): Promise<{position: number; duration: number}> {
  return new Promise(resolve => {
    if (!currentSound) {
      resolve({position: 0, duration: 0});
      return;
    }
    currentSound.getCurrentTime(position => {
      resolve({
        position,
        duration: currentSound?.getDuration() ?? 0,
      });
    });
  });
}

export default {
  setupPlayer,
  playQueue,
  togglePlayback,
  skipToNext,
  skipToPrevious,
  seekTo,
  getProgress,
  onPlaybackStateChange,
  onTrackChange,
};
