 
import {AppRegistry} from 'react-native';
import App from './App';
import 'react-native-reanimated'
import {name as appName} from './app.json';
  
import axios from 'axios'
axios.defaults.baseURL = 'https://server.pistonol.cloud/api';
// axios.defaults.baseURL = 'http://10.24.2.154:5000/api';

AppRegistry.registerComponent(appName, () => App);