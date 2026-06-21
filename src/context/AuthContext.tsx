import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Session} from '@supabase/supabase-js';
import {supabase} from '../config/supabase';

type AuthContextType = {
  session: Session | null;
  userId: string | null;
  isAnonymous: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{error: string | null}>;
  signIn: (email: string, password: string) => Promise<{error: string | null}>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GUEST_ID_KEY = 'spotify_clone_guest_id';

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
    const {data: listener} = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function init() {
    try {
      const {data} = await supabase.auth.getSession();
      setSession(data.session);
      if (!data.session) {
        const existingGuestId = await AsyncStorage.getItem(GUEST_ID_KEY);
        if (existingGuestId) setGuestId(existingGuestId);
      }
    } catch (err) {
      console.error('Erreur initialisation auth:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    const {error} = await supabase.auth.signUp({email, password});
    return {error: error ? error.message : null};
  }

  async function signIn(email: string, password: string) {
    const {error} = await supabase.auth.signInWithPassword({email, password});
    return {error: error ? error.message : null};
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function continueAsGuest() {
    let id = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = 'guest-' + Math.random().toString(36).substring(2) + Date.now();
      await AsyncStorage.setItem(GUEST_ID_KEY, id);
    }
    setGuestId(id);
  }

  const userId = session?.user?.id ?? guestId;
  const isAnonymous = !session && !!guestId;

  return (
    <AuthContext.Provider
      value={{session, userId, isAnonymous, loading, signUp, signIn, signOut, continueAsGuest}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
