import React, {createContext, useContext, useState, useCallback} from 'react';
import {Event, State, useTrackPlayerEvents} from 'react-native-track-player';
import {Track} from '../types';
import {playQueue as playQueueService, togglePlayback, skipToNext, skipToPrevious} from '../services/playerService';
import {getLocalPathIfDownloaded} from '../services/offlineService';
import {useAuth} from './AuthContext';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {queueSyncAction} from '../services/syncService';
import {supabase} from '../config/supabase';

type PlayerContextType = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({children}: {children: React.ReactNode}) {
  const {userId} = useAuth();
  const isOnline = useNetworkStatus();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackActiveTrackChanged],
    async event => {
      if (event.type === Event.PlaybackState) {
        setIsPlaying(event.state === State.Playing);
      }
      if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
        const matched = queue.find(t => t.id === event.track?.id);
        if (matched) {
          setCurrentTrack(matched);
          logListening(matched.id);
        }
      }
    },
  );

  const logListening = useCallback(
    async (trackId: string) => {
      if (!userId) return;
      if (isOnline) {
        await supabase
          .from('listening_history')
          .insert({user_id: userId, track_id: trackId});
      } else {
        await queueSyncAction('add_listening_history', {userId, trackId});
      }
    },
    [userId, isOnline],
  );

  async function playQueue(tracks: Track[], startIndex: number = 0) {
    const localPaths: Record<string, string> = {};
    for (const track of tracks) {
      const p = await getLocalPathIfDownloaded(track.id);
      if (p) localPaths[track.id] = p;
    }
    await playQueueService(tracks, startIndex, localPaths);
    setQueue(tracks);
    setCurrentTrack(tracks[startIndex] ?? null);
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        playQueue,
        togglePlay: togglePlayback,
        next: skipToNext,
        previous: skipToPrevious,
      }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé dans PlayerProvider');
  return ctx;
}
