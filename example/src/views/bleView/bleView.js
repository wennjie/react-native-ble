import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
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
  RefreshControl
} from 'react-native';
import { Toast } from 'antd-mobile';

import BleManager from 'react-native-ble-manager';
import { stringToBytes, bytesToString } from 'convert-string';
const window = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
let click=false 
export default class BleView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      info: '',
      infos: '',
      macId: '',
    }
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.stopServer = this.stopServer.bind(this)
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);



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

    this.retrieveConnected()
    this.startScan()

  }

  handleAppStateChange(nextAppState) { //监听前台 后台
    // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    //   console.log('App已经到了前台!')
    //   BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
    //     console.log(peripheralsArray)
    //     console.log('连接外围设备: ' + peripheralsArray.length + '个');
    //   });
    // }
    // this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
    console.log('溢出了')
    this.stopScan()
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
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

  handleUpdateValueForCharacteristic(data) { //监听返回的值
    // console.log('来信的数据 ' + data.peripheral + ' 特征 ' + data.characteristic, data.value);
    console.log(bytesToString(data.value))
  }

  handleStopScan() {
    console.log('搜索结束');
    this.setState({ scanning: false });
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
  stopScan() {
    BleManager.stopScan().then()

  }
  _onRefresh() {
    this.stopScan()
    this.retrieveConnected()
    this.startScan()


    setTimeout(()=>{
      console.log('断开去')
      this.stopScan()
    },5000)
  }
  startScan() { //开始搜索蓝牙
    if (!this.state.scanning) {
      this.setState({ peripherals: new Map() });
      BleManager.scan([], 50, true).then((results) => {
        console.log('蓝牙搜索中...');
        this.setState({ scanning: true });
      });

    }
  }
  retrieveConnected() { //查看已连接蓝牙
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



  handleDiscoverPeripheral(peripheral) {// 监听搜索到蓝牙// add 到 obj 里
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      peripheral.connected = peripheral.connected != true ? false : true
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }




  test(peripheral) {
    this.setState({
      time:new Date()
    })
    let t= new Date()-this.state.time
    
    if(t<1000) return 
    console.log(t)
    let peripherals = this.state.peripherals;
    let p = peripherals.get(peripheral.id);


    if (peripheral.connected  ) {
      Toast.loading(`断开${peripheral.name}中..`, 10)
      // click=false
      console.log('断开')
      BleManager.disconnect(peripheral.id).then(() => {
        p.connected = false;
        peripherals.set(peripheral.id, p);
        this.setState({ peripherals });
        setTimeout(() => {
          Toast.hide()
        }, 800)
      })
      return
    } else {
      // click=true
      console.log('连接')
      Toast.loading(`连接${peripheral.name}中..`, 10)
      BleManager.connect(peripheral.id).then(() => {//连接蓝牙
        if (p) {
          p.connected = true;
          peripherals.set(peripheral.id, p);
          this.setState({ peripherals });
        }
        Toast.hide()
        Toast.info('连接到' + peripheral.name, 1);

        this.props.navigator.pop({
          animated: true, // does the pop have transition animation or does it happen immediately (optional)
          animationType: 'fade', // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
        });

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

            return

            console.log(`搜索到的服务`);
            console.log(peripheralInfo)


            let int32 = new Int32Array(14)
            int32[0] = 16
            let data = [...stringToBytes('#'), ...int32, ...stringToBytes('@')]
            console.log(data)
            let characteristics = peripheralInfo.characteristics  //特征

            let pId = peripheralInfo.id
            characteristics.map((i) => {
              if (i.characteristic == '1111') {
                // setTimeout(()=>{
                //   BleManager.read(pId,i.service, i.characteristic)
                //   .then((readData) => {
                //     // Success code
                //     console.log('Read: ' + readData+ '__'+ readData.length);

                //     // const buffer = Buffer.Buffer.from(readData);    //https://github.com/feross/buffer#convert-arraybuffer-to-buffer
                //     // const sensorData = buffer.readUInt8(1, true);
                //   })
                //   .catch((error) => {
                //     // Failure code
                //     console.log(error);
                //   });
                // },500)
                BleManager.write(pId, i.service, i.characteristic, data)
                  .then((res) => {
                    // Success code
                    console.log('Write: ' + data);
                  })
                  .catch((error) => {
                    // Failure code
                    console.log(error);
                  });
                setTimeout(() => {
                  BleManager.startNotification(pId, i.service, i.characteristic, data).then((res) => {
                    console.log('Started notification on ' + pId);
                    console.log(res)

                  }).catch((error) => {
                    console.log('Notification error', error);
                  });
                }, 200);
              }

            })

          });

        }, 900);
      }).catch((error) => {
        Toast.info(`连接${peripheral.name}失败..`, 2)
      });
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
              refreshing={false}
              onRefresh={this._onRefresh.bind(this)}
              tintColor="#ff0000"
              title="Loading..."
              titleColor="#00ff00"
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00"
            />
          )}>
          {(list.length == 0) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>下拉搜索蓝牙设备</Text>
            </View>
          }
          <ListView
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
          />
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
    margin: 10
  },
});
