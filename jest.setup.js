jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => Promise.resolve({ rows: [] })),
    executeSync: jest.fn(() => ({ rows: [] })),
  })),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
}));

jest.mock('@react-native-community/slider', () => 'Slider');

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mocked-document-directory',
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve({ statusCode: 200 }),
  })),
  unlink: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn(() => Promise.resolve()),
    updateOptions: jest.fn(() => Promise.resolve()),
    setRepeatMode: jest.fn(() => Promise.resolve()),
    reset: jest.fn(() => Promise.resolve()),
    add: jest.fn(() => Promise.resolve()),
    skip: jest.fn(() => Promise.resolve()),
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    getPlaybackState: jest.fn(() => Promise.resolve({ state: 'idle' })),
    skipToNext: jest.fn(() => Promise.resolve()),
    skipToPrevious: jest.fn(() => Promise.resolve()),
    addEventListener: jest.fn(),
    registerPlaybackService: jest.fn(),
  },
  useTrackPlayerEvents: jest.fn(),
  Event: {
    PlaybackState: 'playback-state',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
  },
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  Capability: {
    Play: 'play',
    Pause: 'pause',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
    SeekTo: 'seek-to',
    Stop: 'stop',
  },
  RepeatMode: {
    Off: 'off',
  },
  AppKilledPlaybackBehavior: {
    ContinuePlayback: 'continue-playback',
  },
}));

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    ScreenContainer: View,
    Screen: View,
    ScreenStack: View,
    ScreenStackItem: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
    compatibilityFlags: {
      usesNewAndroidHeaderHeightImplementation: false,
    },
    useTransitionProgress: jest.fn(() => ({
      progress: 0,
      closing: 0,
      goingForward: 0,
    })),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    SafeAreaInsetsContext: React.createContext(inset),
  };
});
