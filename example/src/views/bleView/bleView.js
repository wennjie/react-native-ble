import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ListView,
  ScrollView,
  AppState,
  Dimensions,
  Alert,
  RefreshControl,
  DeviceEventEmitter
} from 'react-native';
import { Toast } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
import { stringToBytes ,bytesToString} from 'convert-string';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class BleView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      info: '',
      infos: '',
      macId: ''
    }
    this.peripheralId=''
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.stopServer = this.stopServer.bind(this)
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
 
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("安卓权限开启  OK");
        } else {
          PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App已经到了前台!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('连接外围设备: ' + peripheralsArray.length + '个');
      });
    }
    this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
   
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
    console.log('断开了 ' + data.peripheral);
  }
  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log('获取到蓝牙设备', peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  handleStopScan() {
    console.log('搜索结束');
    this.setState({ scanning: false });
  }
  returnUUIDS(e){
    

    setTimeout(()=>{
      DeviceEventEmitter.emit('RETURNUUIDS',e); //发监听
      this.props.navigator.pop()
    },3000)
     
  }
  _onRefresh(){
    this.startScan()
  }
  stopServer() {
    BleManager.disconnect(this.state.macId)
      .then(() => {
        // Success code
        console.log('Disconnected');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  stopScan(){

  }
  startScan() {
    //搜索蓝牙
    if (!this.state.scanning) {
      this.setState({ peripherals: new Map() });
      BleManager.scan([], 5, true).then((results) => {
        console.log('搜索中...');
        this.setState({ scanning: true });
      });
    }
  }

  retrieveConnected() {
    BleManager.getConnectedPeripherals([]).then((results) => {
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
      }
    });
  }

  
  disconnect(id){
    BleManager.disconnect(id);
}  
  checkItem(peripheral){ //点击是否有蓝牙在连接
    if(this.isCheckItem) return  //有的话
    this.test(peripheral)
  }
  test(peripheral) {

    if (peripheral) {
      if (peripheral.connected) {
        this.disconnect(peripheral.id)
      } else {
        this.isCheckItem=true
        BleManager.connect(peripheral.id).then(() => {//连接蓝牙
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }
          this.isCheckItem=false
          console.log('连接到' + peripheral.id);
          this.returnUUIDS(peripheral)
          return 
          setTimeout(() => {

            /* Test read current RSSI value
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
              });
            });*/

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
           
        
              console.log(`搜索到的服务`);
              console.log(peripheralInfo)
              function requestZore(place){
                let a=0
              a |= (1 << place)
                return a
                
            }
        
            function int2bytes(v){
                
                let i0 = (v>>24)&0xff
                let i1=(v>>16)&0xff
                let i2=(v>>8)&0xff
                let i3 = (v>>0)&0xff
                return [i3,i0,i1,i2]

            }
            function bytesToint32(v){
             return   ((v[0]&0xff) <<0) | ((v[1]&0xff) <<16) | ((v[2]&0xff) <<8) | ((v[3]&0xff) <<24)
            }

           console.log( bytesToint32(int2bytes(8)))
            let data=[...stringToBytes('#'),...int2bytes(requestZore(3)),...int2bytes(0),...int2bytes(0),...stringToBytes('@')]

              let characteristics = peripheralInfo.characteristics  //特征
              
              let pId = peripheralInfo.id
              characteristics.map((i) => {
                if (i.characteristic == 'fff6') {
                  
                  BleManager.write(pId,i.service, i.characteristic,data)
                  .then(() => {
                      console.log('Write success: ',data.toString());
                      
                  })
                  .catch((error) => {
                      console.log('Write  failed: ',data);
                      
                  });
        
                  BleManager.startNotification(pId,i.service, i.characteristic).then((res) => {
                    console.log('Started notification on ' + pId);
                    console.log(res)
      
                  }).catch((error) => {
                    console.log('Notification error', error);
                  });
                


                }

              })




              
            });

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  render() {
    const list = Array.from(this.state.peripherals.values()); //获取到蓝牙列表
    const dataSource = ds.cloneWithRows(list);
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll}
          refreshControl={(
            <RefreshControl
              refreshing={this.state.scanning}
              onRefresh={this._onRefresh.bind(this)}
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00"
            />
          )}>
          {/* {(list.length == 0) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>下拉搜索蓝牙设备</Text>
            </View>
          } */}

          {
            list.map((item,index)=>{
              const color = item.connected ? 'green' : '#fff';
              return(
                <TouchableWithoutFeedback onPress={() => this.test(item)} key={index}>
                <View style={[styles.row, { backgroundColor: color }]}>
                  <Text style={{ fontSize: 12, textAlign: 'center', color: '#000000', padding: 5 }}>{item.name}</Text>
                  <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 5 }}>{item.id}</Text>
                </View>
              </TouchableWithoutFeedback>
              )
            })
          }
          {/* <ListView
            enableEmptySections={true}
            dataSource={dataSource}
            renderRow={(item) => {
              const color = item.connected ? 'green' : '#fff';
              return (
                <TouchableHighlight onPress={() => this.test(item)}>
                  <View style={[styles.row, { backgroundColor: color }]}>
                    <Text style={{ fontSize: 12, textAlign: 'center', color: '#000000', padding: 10 }}>{item.name}</Text>
                    <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{item.id}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
          /> */}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  row: {
    margin: 5
  },
});
