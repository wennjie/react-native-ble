import { Navigation } from 'react-native-navigation';

import bleView from '../src/views/bleView/bleView';
import Login from '../src/views/login/login';

// register all screens of the app (including internal ones)
export function registerScreens() {
  Navigation.registerComponent('example.bleView', () => bleView);
  Navigation.registerComponent('example.Login', () => Login);
}