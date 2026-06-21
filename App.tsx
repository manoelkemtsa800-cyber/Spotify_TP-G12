import React, {useEffect} from 'react';
import {ScrollView, Text} from 'react-native';
import {AuthProvider} from './src/context/AuthContext';
import {PlayerProvider} from './src/context/PlayerContext';
import RootNavigator from './src/navigation/RootNavigator';
import {setupPlayer} from './src/services/playerService';
import {useNetworkStatus} from './src/hooks/useNetworkStatus';
import {processSyncQueue} from './src/services/syncService';

class ErrorBoundary extends React.Component
  {children: React.ReactNode},
  {error: Error | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {error: null};
  }
  static getDerivedStateFromError(error: Error) {
    return {error};
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erreur capturee par ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{flex: 1, backgroundColor: '#000', padding: 20, marginTop: 40}}>
          <Text style={{color: 'red', fontSize: 16, fontWeight: 'bold'}}>
            Erreur app:
          </Text>
          <Text style={{color: 'white', marginTop: 10}}>
            {this.state.error.name}: {this.state.error.message}
          </Text>
          <Text style={{color: '#888', marginTop: 10, fontSize: 12}}>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function AutoSync() {
  const isOnline = useNetworkStatus();
  useEffect(() => {
    if (isOnline) {
      processSyncQueue().catch(err =>
        console.error('Erreur synchro:', err),
      );
    }
  }, [isOnline]);
  return null;
}

export default function App() {
  useEffect(() => {
    setupPlayer().catch(err =>
      console.error('Erreur setup player:', err),
    );
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerProvider>
          <AutoSync />
          <RootNavigator />
        </PlayerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
