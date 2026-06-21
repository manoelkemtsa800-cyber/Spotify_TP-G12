import {AppRegistry, Alert} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  Alert.alert(
    isFatal ? 'Erreur fatale' : 'Erreur',
    `${error.name}: ${error.message}\n\n${error.stack}`,
    [{text: 'OK'}],
  );
});

AppRegistry.registerComponent(appName, () => App);
