import React, {useState, useEffect, useRef} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import Slider from '@react-native-community/slider';
import {usePlayer} from '../context/PlayerContext';
import {seekTo, getProgress} from '../services/playerService';
import {downloadTrackForOffline, isTrackDownloaded} from '../services/offlineService';
import {useNetworkStatus} from '../hooks/useNetworkStatus';

export default function PlayerScreen() {
  const {currentTrack, isPlaying, togglePlay, next, previous} = usePlayer();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const isOnline = useNetworkStatus();
  const [downloading, setDownloading] = useState(false);
  const [dlPercent, setDlPercent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const progress = await getProgress();
      setPosition(progress.position);
      setDuration(progress.duration);
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentTrack]);

  if (!currentTrack) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyText}>Aucune piste en cours</Text>
      </View>
    );
  }

  async function handleDownload() {
    if (!currentTrack) return;
    if (await isTrackDownloaded(currentTrack.id)) {
      Alert.alert('Deja telechargee', 'Cette piste est deja disponible hors-ligne.');
      return;
    }
    if (!isOnline) {
      Alert.alert('Hors-ligne', 'Connexion requise pour telecharger.');
      return;
    }
    setDownloading(true);
    try {
      await downloadTrackForOffline(currentTrack, setDlPercent);
      Alert.alert('Succes', 'Piste disponible hors-ligne !');
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Echec du telechargement.');
    } finally {
      setDownloading(false);
      setDlPercent(0);
    }
  }

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={s.container}>
      {currentTrack.cover_url ? (
        <Image source={{uri: currentTrack.cover_url}} style={s.cover} />
      ) : (
        <View style={[s.cover, s.placeholder]}>
          <Text style={s.placeholderText}>🎵</Text>
        </View>
      )}

      <Text style={s.title} numberOfLines={2}>{currentTrack.title}</Text>
      <Text style={s.artist}>{currentTrack.artist}</Text>

      <Slider
        style={s.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#444"
        thumbTintColor="#1DB954"
        onSlidingComplete={v => seekTo(v)}
      />
      <View style={s.timeRow}>
        <Text style={s.timeText}>{fmt(position)}</Text>
        <Text style={s.timeText}>{fmt(duration)}</Text>
      </View>

      <View style={s.controls}>
        <TouchableOpacity onPress={previous}>
          <Text style={s.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.playBtn} onPress={togglePlay}>
          <Text style={s.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next}>
          <Text style={s.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.dlBtn} onPress={handleDownload} disabled={downloading}>
        {downloading ? (
          <>
            <ActivityIndicator color="#1DB954" size="small" />
            <Text style={s.dlText}>{dlPercent}%</Text>
          </>
        ) : (
          <Text style={s.dlText}>⬇ Disponible hors-ligne</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', alignItems: 'center', paddingTop: 40, paddingHorizontal: 24},
  centered: {flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'},
  emptyText: {color: '#888', fontSize: 16},
  cover: {width: 280, height: 280, borderRadius: 12, marginBottom: 32},
  placeholder: {backgroundColor: '#333', justifyContent: 'center', alignItems: 'center'},
  placeholderText: {fontSize: 64},
  title: {color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center'},
  artist: {color: '#888', fontSize: 16, marginTop: 6, marginBottom: 24},
  slider: {width: '100%', height: 40},
  timeRow: {flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: -8},
  timeText: {color: '#888', fontSize: 12},
  controls: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 32, gap: 40},
  controlIcon: {fontSize: 28, color: '#fff'},
  playBtn: {backgroundColor: '#1DB954', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center'},
  playIcon: {fontSize: 28, color: '#000'},
  dlBtn: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 40, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#444'},
  dlText: {color: '#1DB954', fontSize: 14},
});
