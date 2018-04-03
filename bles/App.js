import { StackNavigator } from 'react-navigation';
import Home from './src/views/login/login'
//源码分析  
//引入
//首页 WEB、、NAMTIVE  //删除web
import  Router  from './src/router/router';
//const getOptions = title => (
//	
//	
//	{
//	//获取设设置title
//title,
//headerStyle: {
//  backgroundColor: 'white',
//  borderBottomColor:'white'
//  
//},
//headerTintColor: 'white',
//});


function getOptions(title){ //改写getOptions 函数 // 同时应可同台设置
	if(title=='首页'){
		return {
			//获取设设置title
		  title,
		  headerStyle: {
		    backgroundColor: 'white',
		    borderBottomColor:'white'
		  },
		  headerTintColor: 'white',
		}
	}else{
		return {
	//获取设设置title
		  title,
		  headerStyle: {
		    backgroundColor: '#0A9DC7',
		  },
		  headerTintColor: 'white',
		}
	}
}
const scenes = {
  // Home: {
  //   screen: Home,
  //   //模板引入
  //   navigationOptions: getOptions('首页'),
  //   //header样式
  // },
  // native: {
  //   screen: RnIndex,
  //   navigationOptions: getOptions('Antm React Native'),
  //   mode:'modal'
  // },
};

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