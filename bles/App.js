import { StackNavigator } from 'react-navigation';
import Home from './src/views/login/login'

//引入
import  Router  from './src/router/router';


function getOptions(title){ //改写getOptions 函数 // 同时应可同台设置
	if(title=='Login'){
		return {
			//获取设设置title
			title,
			header:null,
		  headerStyle: {
		    backgroundColor: 'white',
		    borderBottomColor:'white'
			},
			cardStack: {
        gesturesEnabled: false  // 是否可以右滑返回
    },
		  headerTintColor: 'white',
		}
	}else{
		return {
	//获取设设置title
			title,
			header:null,
		  headerStyle: {
		    backgroundColor: '#0A9DC7',
			},
			cardStack: {
        gesturesEnabled: false  // 是否可以右滑返回
    },
			cardStack:true,
		  headerTintColor: 'white',
		}
	}
}
const scenes = {}

Router.map((component) => {
  const Module = component.module.default;
  scenes[component.title] = {
    screen: Module,
    navigationOptions: getOptions(component.title),
    mode:'card',
    headerMode:'screen'
  };
});

const App = StackNavigator(scenes);

export default App;