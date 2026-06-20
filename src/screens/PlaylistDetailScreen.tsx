import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert} from 'react-native';
import {Track} from '../types';
import {fetchPlaylistTracks, removeTrackFromPlaylist} from '../services/playlistService';
import {usePlayer} from '../context/PlayerContext';

export default function PlaylistDetailScreen({route, navigation}: any) {
  const {playlist} = route.params;
  const [tracks, setTracks] = useState<Track[]>([]);
  const {playQueue} = usePlayer();

  const load = useCallback(async () => {
    try {
      const data = await fetchPlaylistTracks(playlist.id);
      setTracks(data);
    } catch (err) {
      console.error(err);
    }
  }, [playlist.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={s.container}>
      <Text style={s.header}>{playlist.name}</Text>
      {playlist.description && <Text style={s.desc}>{playlist.description}</Text>}
      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={s.emptyText}>Playlist vide.</Text>}
        renderItem={({item, index}) => (
          <TouchableOpacity
            style={s.trackRow}
            onPress={async () => {
              await playQueue(tracks, index);
              navigation.navigate('Player');
            }}
            onLongPress={() =>
              Alert.alert('Retirer', 'Retirer cette piste de la playlist ?', [
                {text: 'Annuler', style: 'cancel'},
                {text: 'Retirer', style: 'destructive', onPress: async () => {
                  await removeTrackFromPlaylist(playlist.id, item.id);
                  load();
                }},
              ])
            }>
            {item.cover_url ? (
              <Image source={{uri: item.cover_url}} style={s.cover} />
            ) : (
              <View style={[s.cover, s.placeholder]}><Text>🎵</Text></View>
            )}
            <View>
              <Text style={s.trackTitle}>{item.title}</Text>
              <Text style={s.trackArtist}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16},
  header: {fontSize: 24, fontWeight: 'bold', color: '#fff'},
  desc: {color: '#888', fontSize: 14, marginTop: 4, marginBottom: 12},
  emptyText: {color: '#888', textAlign: 'center', marginTop: 24},
  trackRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  cover: {width: 46, height: 46, borderRadius: 4, marginRight: 12},
  placeholder: {backgroundColor: '#333', justifyContent: 'center', alignItems: 'center'},
  trackTitle: {color: '#fff', fontSize: 15, fontWeight: '600'},
  trackArtist: {color: '#888', fontSize: 13},
});
