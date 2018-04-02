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
  Alert
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';

import {Buffer} from 'buffer';
console.log(Buffer)
// // var toBuffer = require('typedarray-to-buffer')
//  console.log(stringToBytes('$'))
// var arr = new Int32Array(['$', 2, '@'])
// console.log( (arr))


const window = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class Demo extends Component {
  constructor() {
    super()

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      info: '',
      infos: '',
      macId: ''
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

    BleManager.start({ showAlert: false }).then((e) => {
      console.log('蓝牙服务打开???')
    })

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

  handleUpdateValueForCharacteristic(data) {
    console.log('来信的数据 ' + data.peripheral + ' 特征 ' + data.characteristic, data.value);
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
  startScan() {
  
    // return
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

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log('获取到蓝牙设备', peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  test(peripheral) {
    console.log(`点击的设备` + peripheral)
    this.setState({
      info: JSON.stringify(peripheral),
      macId: peripheral.id
    })

    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id).then(() => {//连接蓝牙
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({ peripherals });
          }
          console.log('连接到' + peripheral.id);


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
              // let gga = 0;
              // gga |= (1 << 3);
              // let  bggas = Int2Byte.bytesCopy(gga, 0, 0);
              // [,0,0]
              let int32 = new Int32Array(30)
              int32[3] = 1
              let data = [...stringToBytes('#'),...int32,...stringToBytes('@')]
              // console.log(data)

              // let int32 = new Int32Array(34)
              // int32[3] = 1
              // int32[0]=stringToBytes('$')
              // int32[33]=stringToBytes('@')
              // console.log(int32)

// let int32=new Uint32Array(32)
// console.log(int32)
              let characteristics = peripheralInfo.characteristics  //特征

              let pId = peripheralInfo.id
              characteristics.map((i) => {
                if (i.characteristic == '1111') {
                  console.log(i)
                  // return
                  BleManager.write(pId, i.service, i.characteristic, data)
                    .then((res) => {
                      // Success code
                      console.log('Write: ' + data)


                      setTimeout(() => {
                        BleManager.read(pId, i.service, i.characteristic)
                          .then((readData) => {
                            // Success code
                            console.log('Read: ' + readData + '__' + readData.length);

                            // const buffer = Buffer.Buffer.from(readData);    //https://github.com/feross/buffer#convert-arraybuffer-to-buffer
                            // const sensorData = buffer.readUInt8(1, true);
                          })
                          .catch((error) => {
                            // Failure code
                            console.log(error);
                          });
                      }, 500)

                    })
                    .catch((error) => {
                      // Failure code
                      console.log(error);
                    });
                }

              })




              // setTimeout(() => {
              //   BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
              //     console.log('Started notification on ' + peripheral.id);
              //     setTimeout(() => {
              //       BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
              //         console.log('Writed NORMAL crust');
              //         BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
              //           console.log('Writed 351 temperature, the pizza should be BAKED');
              //           /*
              //           var PizzaBakeResult = {
              //             HALF_BAKED: 0,
              //             BAKED:      1,
              //             CRISPY:     2,
              //             BURNT:      3,
              //             ON_FIRE:    4
              //           };*/
              //         });
              //       });

              //     }, 500);
              //   }).catch((error) => {
              //     console.log('Notification error', error);
              //   });
              // }, 200);
            });

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const dataSource = ds.cloneWithRows(list);


    return (
      <View style={styles.container}>
        <TouchableHighlight style={{ marginTop: 10, margin: 10, padding: 10, backgroundColor: '#ccc' }} onPress={() => this.startScan()}>
          <Text>搜索蓝牙 ({this.state.scanning ? 'on' : 'off'})</Text>
        </TouchableHighlight>
        <TouchableHighlight style={{ marginTop: 0, margin: 10, padding: 10, backgroundColor: '#ccc' }} onPress={() => this.retrieveConnected()}>
          <Text>查看已连接蓝牙</Text>
        </TouchableHighlight>
        <TouchableHighlight style={{ marginTop: 0, margin: 10, padding: 10, backgroundColor: '#ccc' }} onPress={() => this.stopServer()}>
          <Text>断开连接</Text>
        </TouchableHighlight>
        <ScrollView style={styles.scroll}>
          {(list.length == 0) &&
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: 'center' }}>无设备...？</Text>
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
                    <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.name}</Text>
                    <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 10 }}>{item.id}</Text>
                  </View>
                </TouchableHighlight>
              );
            }}
          />
        </ScrollView>
        <ScrollView>
          <Text>{this.state.info} </Text>
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
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10
  },
});
