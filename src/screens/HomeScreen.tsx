import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import {Track} from '../types';
import {fetchTracks} from '../services/trackService';
import {getRecommendations} from '../services/recommendationService';
import {usePlayer} from '../context/PlayerContext';
import {useAuth} from '../context/AuthContext';
import {useNetworkStatus} from '../hooks/useNetworkStatus';

export default function HomeScreen({navigation}: any) {
  const {userId} = useAuth();
  const {playQueue} = usePlayer();
  const isOnline = useNetworkStatus();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!isOnline) return;
    try {
      const data = await fetchTracks();
      setTracks(data);
      if (userId) {
        const recs = await getRecommendations(userId, 10);
        setRecommendations(recs);
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  }, [userId, isOnline]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handlePlay(track: Track, list: Track[]) {
    const index = list.findIndex(t => t.id === track.id);
    await playQueue(list, index >= 0 ? index : 0);
    navigation.navigate('Player');
  }

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color="#1DB954" size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {!isOnline && (
        <View style={s.offlineBanner}>
          <Text style={s.offlineBannerText}>
            Mode hors-ligne — seules les pistes téléchargées sont lisibles
          </Text>
        </View>
      )}
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadData();
              setRefreshing(false);
            }}
          />
        }
        ListHeaderComponent={
          <>
            <View style={s.topBar}>
              <Text style={s.header}>Spotify Clone</Text>
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => navigation.navigate('Upload')}>
                <Text style={s.addBtnText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>
            {recommendations.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Recommandé pour toi</Text>
                <FlatList
                  data={recommendations}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={s.recCard}
                      onPress={() => handlePlay(item, recommendations)}>
                      {item.cover_url ? (
                        <Image source={{uri: item.cover_url}} style={s.recCover} />
                      ) : (
                        <View style={[s.recCover, s.placeholder]}>
                          <Text style={s.placeholderText}>🎵</Text>
                        </View>
                      )}
                      <Text style={s.recTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={s.recArtist} numberOfLines={1}>{item.artist}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            <Text style={s.sectionTitle}>Toutes les pistes</Text>
          </>
        }
        ListEmptyComponent={
          <View style={s.centered}>
            <Text style={s.emptyText}>
              Aucune piste. Appuie sur "+ Ajouter" pour uploader ta première musique !
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <TouchableOpacity style={s.trackRow} onPress={() => handlePlay(item, tracks)}>
            {item.cover_url ? (
              <Image source={{uri: item.cover_url}} style={s.cover} />
            ) : (
              <View style={[s.cover, s.placeholder]}>
                <Text style={s.placeholderText}>🎵</Text>
              </View>
            )}
            <View style={s.trackInfo}>
              <Text style={s.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  offlineBanner: {backgroundColor: '#332700', padding: 8},
  offlineBannerText: {color: '#ffcc66', fontSize: 13, textAlign: 'center'},
  topBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20},
  header: {fontSize: 24, fontWeight: 'bold', color: '#fff'},
  addBtn: {backgroundColor: '#1DB954', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6},
  addBtnText: {color: '#000', fontWeight: '600', fontSize: 13},
  sectionTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, marginVertical: 10},
  recCard: {width: 130, marginLeft: 16},
  recCover: {width: 130, height: 130, borderRadius: 8, marginBottom: 6},
  recTitle: {color: '#fff', fontSize: 13, fontWeight: '600'},
  recArtist: {color: '#888', fontSize: 12},
  trackRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8},
  cover: {width: 50, height: 50, borderRadius: 4, marginRight: 12},
  placeholder: {backgroundColor: '#333', justifyContent: 'center', alignItems: 'center'},
  placeholderText: {fontSize: 20},
  trackInfo: {flex: 1},
  trackTitle: {color: '#fff', fontSize: 16, fontWeight: '600'},
  trackArtist: {color: '#888', fontSize: 14, marginTop: 2},
  emptyText: {color: '#888', textAlign: 'center', fontSize: 15},
});
