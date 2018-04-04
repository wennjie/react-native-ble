import {Platform} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {registerScreens, registerScreenVisibilityListener} from './screens';


// screen related book keeping
registerScreens();
// registerScreenVisibilityListener();

// this will start our app
Navigation.startSingleScreenApp({
  screen: {
    screen: 'Home', // unique ID registered with Navigation.registerScreen
    title: 'Welcome', // title of the screen as appears in the nav bar (optional)
    navigatorStyle: {
      // navBarHidden: true,
      // tabBarBackgroundColor: '#003a66',
      // navBarBackgroundColor: '#003a66',
      // navBarBlur: true,
    }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
    navigatorButtons: {} // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
  },
  animationType: Platform.OS === 'ios' ? 'slide-down' : 'fade',
  // tabsStyle: {
  //   tabBarBackgroundColor: '#003a66',
  //   tabBarButtonColor: '#ffffff',
  //   tabBarSelectedButtonColor: '#ff505c',
  //   tabFontFamily: 'BioRhyme-Bold',
  // },
  appStyle: {
    navBarButtonColor: '#ffffff',
    navBarTextColor: '#ffffff',
    navigationBarColor: '#003a66',
    navBarBackgroundColor: '#003a66',
    statusBarColor: '#002b4c',
    statusBarHidden: false,
    navBarHidden: false,
    hideBackButtonTitle:true
  },
  // drawer: {
  //   left: {
  //     screen: 'example.Types.Drawer'
  //   }
  // }
});
