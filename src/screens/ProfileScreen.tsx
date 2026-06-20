import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {useAuth} from '../context/AuthContext';

export default function ProfileScreen() {
  const {session, isAnonymous, userId, signOut} = useAuth();

  return (
    <View style={s.container}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{isAnonymous ? '👤' : '🎧'}</Text>
      </View>
      <Text style={s.name}>{isAnonymous ? 'Invité' : session?.user?.email}</Text>
      <Text style={s.id}>ID : {userId?.substring(0, 20)}...</Text>

      {isAnonymous && (
        <Text style={s.warning}>
          Mode invité — tes données sont liées à cet appareil uniquement.
          Crée un compte pour les conserver.
        </Text>
      )}

      {!isAnonymous && (
        <TouchableOpacity
          style={s.signOutBtn}
          onPress={() =>
            Alert.alert('Déconnexion', 'Veux-tu te déconnecter ?', [
              {text: 'Annuler', style: 'cancel'},
              {text: 'Se déconnecter', style: 'destructive', onPress: signOut},
            ])
          }>
          <Text style={s.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24},
  avatar: {width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 20},
  avatarText: {fontSize: 40},
  name: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  id: {color: '#666', fontSize: 12, marginTop: 4, marginBottom: 20},
  warning: {color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 24},
  signOutBtn: {borderColor: '#ff4444', borderWidth: 1, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32, marginTop: 12},
  signOutText: {color: '#ff4444', fontSize: 15},
});
