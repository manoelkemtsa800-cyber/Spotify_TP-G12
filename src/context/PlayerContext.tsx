import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import {Track} from '../types';
import {
  playQueue as playQueueService,
  togglePlayback,
  skipToNext,
  skipToPrevious,
  onPlaybackStateChange,
  onTrackChange,
} from '../services/playerService';
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

  useEffect(() => {
    const unsubState = onPlaybackStateChange(playing => {
      setIsPlaying(playing);
    });
    const unsubTrack = onTrackChange((track, _index) => {
      setCurrentTrack(track);
      if (track) logListening(track.id);
    });
    return () => {
      unsubState();
      unsubTrack();
    };
  }, [logListening]);

  async function playQueue(tracks: Track[], startIndex: number = 0) {
    const localPaths: Record<string, string> = {};
    for (const track of tracks) {
      const p = await getLocalPathIfDownloaded(track.id);
      if (p) localPaths[track.id] = p;
    }
    await playQueueService(tracks, startIndex, localPaths);
    setQueue(tracks);
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
  if (!ctx) throw new Error('usePlayer doit etre utilise dans PlayerProvider');
  return ctx;
}
