 
import {AppRegistry} from 'react-native';
import App from './App';
import 'react-native-reanimated'
import {name as appName} from './app.json';
  
import axios from 'axios'
axios.defaults.baseURL = 'http://10.153.144.209:5000/api';

AppRegistry.registerComponent(appName, () => App);
