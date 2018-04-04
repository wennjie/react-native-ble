import { Navigation, ScreenVisibilityListener } from 'react-native-navigation';

import Login from '../views/login/login'
import Home from '../views/home/home'
import bleView from '../views/bleView/bleView'
import basicSetting from '../views/setting/basicSetting'
import locationSetting from '../views/setting/locationSetting'

export function registerScreens() {
  Navigation.registerComponent('Login', () => Login);
  Navigation.registerComponent('Home', () => Home);
  Navigation.registerComponent('bleView', () => bleView);
  Navigation.registerComponent('basicSetting', () => basicSetting);
  Navigation.registerComponent('locationSetting', () => locationSetting);

}

export function registerScreenVisibilityListener() {
  new ScreenVisibilityListener({
    willAppear: ({ screen }) => console.log(`Displaying screen ${screen}`),
    didAppear: ({ screen, startTime, endTime, commandType }) => console.log('screenVisibility', `Screen ${screen} displayed in ${endTime - startTime} millis [${commandType}]`),
    willDisappear: ({ screen }) => console.log(`Screen will disappear ${screen}`),
    didDisappear: ({ screen }) => console.log(`Screen disappeared ${screen}`)
  }).register();
}
