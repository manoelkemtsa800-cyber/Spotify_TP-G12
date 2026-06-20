import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {DownloadedTrack} from '../types';
import {getDownloadedTracks, removeDownloadedTrack} from '../services/offlineService';

export default function DownloadsScreen({navigation}: any) {
  const [downloads, setDownloads] = useState<DownloadedTrack[]>([]);

  const load = useCallback(async () => {
    const data = await getDownloadedTracks();
    setDownloads(data);
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  return (
    <View style={s.container}>
      <Text style={s.header}>Téléchargements</Text>
      <FlatList
        data={downloads}
        keyExtractor={item => item.track_id}
        ListEmptyComponent={
          <Text style={s.emptyText}>
            Aucune piste téléchargée. Appuie sur "Disponible hors-ligne" depuis le lecteur.
          </Text>
        }
        renderItem={({item}) => (
          <View style={s.row}>
            <Text style={s.name} numberOfLines={1}>
              {item.local_file_path.split('/').pop()}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Supprimer', 'Retirer cette piste hors-ligne ?', [
                  {text: 'Annuler', style: 'cancel'},
                  {text: 'Supprimer', style: 'destructive', onPress: async () => {
                    await removeDownloadedTrack(item.track_id);
                    load();
                  }},
                ])
              }>
              <Text style={s.deleteText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', paddingTop: 16, paddingHorizontal: 16},
  header: {fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16},
  emptyText: {color: '#888', textAlign: 'center', marginTop: 24},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomColor: '#222', borderBottomWidth: 1},
  name: {color: '#fff', fontSize: 14, flex: 1, marginRight: 12},
  deleteText: {color: '#ff4444', fontSize: 14},
});
