import {AppRegistry, Alert} from 'react-native';
import {name as appName} from './app.json';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Erreur globale capturee:', error);
  Alert.alert(
    isFatal ? 'Erreur fatale' : 'Erreur',
    `${error.name}: ${error.message}\n\n${error.stack}`,
    [{text: 'OK'}],
  );
});

try {
  const App = require('./App').default;
  AppRegistry.registerComponent(appName, () => App);
} catch (err) {
  console.error('Erreur au chargement de App.tsx:', err);
  const FallbackApp = () => {
    const React = require('react');
    const {View, Text} = require('react-native');
    return React.createElement(
      View,
      {style: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20}},
      React.createElement(Text, {style: {color: 'red', fontSize: 16, marginBottom: 10}}, 'Erreur au demarrage:'),
      React.createElement(Text, {style: {color: '#fff', fontSize: 12}}, String(err)),
    );
  };
  AppRegistry.registerComponent(appName, () => FallbackApp);
}
