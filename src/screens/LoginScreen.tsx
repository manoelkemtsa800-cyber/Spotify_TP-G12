import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import {useAuth} from '../context/AuthContext';

export default function LoginScreen() {
  const {signIn, signUp, continueAsGuest} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Merci de remplir email et mot de passe.');
      return;
    }
    setLoading(true);
    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);
    if (result.error) Alert.alert('Erreur', result.error);
  }

  return (
    <View style={s.container}>
      <Text style={s.logo}>🎵 Spotify Clone</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={s.primaryBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={s.primaryBtnText}>
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={s.switchText}>
          {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>

      <View style={s.divider} />

      <TouchableOpacity
        style={s.guestBtn}
        onPress={async () => {
          setLoading(true);
          await continueAsGuest();
          setLoading(false);
        }}
        disabled={loading}>
        <Text style={s.guestBtnText}>Continuer sans compte</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121212', justifyContent: 'center', paddingHorizontal: 24},
  logo: {fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 40},
  input: {backgroundColor: '#222', color: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, fontSize: 16},
  primaryBtn: {backgroundColor: '#1DB954', borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 12},
  primaryBtnText: {color: '#000', fontWeight: 'bold', fontSize: 16},
  switchText: {color: '#1DB954', textAlign: 'center', marginTop: 16},
  divider: {height: 1, backgroundColor: '#333', marginVertical: 24},
  guestBtn: {borderColor: '#888', borderWidth: 1, borderRadius: 24, paddingVertical: 14, alignItems: 'center'},
  guestBtnText: {color: '#fff', fontSize: 16},
});
