import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert} from 'react-native';
import {Playlist} from '../types';
import {fetchUserPlaylists, createPlaylist} from '../services/playlistService';
import {getDownloadedTracks} from '../services/offlineService';
import {useAuth} from '../context/AuthContext';

export default function LibraryScreen({navigation}: any) {
  const {userId} = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [dlCount, setDlCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchUserPlaylists(userId);
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
    const dl = await getDownloadedTracks();
    setDlCount(dl.length);
  }, [userId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  async function handleCreate() {
    if (!newName.trim() || !userId) return;
    try {
      await createPlaylist({name: newName.trim(), ownerId: userId});
      setNewName('');
      setModalVisible(false);
      load();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de créer la playlist.');
    }
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.header}>Bibliothèque</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={s.addBtn}>+ Playlist</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.offlineRow} onPress={() => navigation.navigate('Downloads')}>
        <Text style={s.offlineIcon}>⬇</Text>
        <View>
          <Text style={s.offlineTitle}>Musique téléchargée</Text>
          <Text style={s.offlineSub}>{dlCount} piste(s) hors-ligne</Text>
        </View>
      </TouchableOpacity>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={s.emptyText}>Aucune playlist. Crée-en une !</Text>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={s.playlistRow}
            onPress={() => navigation.navigate('PlaylistDetail', {playlist: item})}>
            <View style={s.playlistCover}><Text>🎶</Text></View>
            <Text style={s.playlistName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nouvelle playlist</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Nom de la playlist"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}>
                <Text style={s.confirmText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  header: {fontSize: 24, fontWeight: 'bold', color: '#fff'},
  addBtn: {color: '#1DB954', fontSize: 15, fontWeight: '600'},
  offlineRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 8, padding: 12, marginBottom: 20},
  offlineIcon: {fontSize: 22, marginRight: 12, color: '#1DB954'},
  offlineTitle: {color: '#fff', fontSize: 15, fontWeight: '600'},
  offlineSub: {color: '#888', fontSize: 13},
  emptyText: {color: '#888', textAlign: 'center', marginTop: 24},
  playlistRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  playlistCover: {width: 46, height: 46, borderRadius: 4, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12},
  playlistName: {color: '#fff', fontSize: 16},
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 32},
  modal: {backgroundColor: '#222', borderRadius: 12, padding: 20},
  modalTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16},
  modalInput: {backgroundColor: '#333', color: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20},
  modalActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 24},
  cancelText: {color: '#888', fontSize: 15},
  confirmText: {color: '#1DB954', fontSize: 15, fontWeight: '600'},
});
