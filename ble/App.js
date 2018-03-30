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
const window = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      scanning:false,
      list:[]
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    BleManager.start({ showAlert: false }).then((e) => {
      // Alert.alert('蓝牙服务打开')
    })

    // this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    // this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    // this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    // this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
    //权限
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
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
  handleAppStateChange() {

  }
  startBleManager() {//开始蓝牙
    BleManager.start({ showAlert: false })
      .then(() => {
        // Success code
        console.log('Module initialized');
      });
  }
  startScan() {
    if (!this.state.scanning) {
      BleManager.scan([], 5, true).then((results) => {
        console.log('Scanning...');
        this.setState({ scanning: true, infos: '123' });


        this.getDiscoveredPeripherals()
      });
    }
  }
  stopScan() {
    BleManager.stopScan()
      .then(() => {
        // Success code
        console.log('Scan stopped');
      });
  }
  connectBle(macId) {//蓝牙连接
    BleManager.connect(macId)
      .then(() => {
        // Success code
        console.log('Connected');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  disconnectBle(macId) {//断开蓝牙连接
    BleManager.disconnect(macId)
      .then(() => {
        // Success code
        console.log('Disconnected');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  enableBluetooth() {//激活蓝牙
    BleManager.enableBluetooth()
      .then(() => {
        // Success code
        console.log('The bluetooh is already enabled or the user confirm');
      })
      .catch((error) => {
        // Failure code
        console.log('The user refuse to enable bluetooth');
      });
  }
  checkState() {//强制模块检查BLE的状态并触发BleManagerDidUpdateState事件。
    BleManager.checkState()

  }
  startNotification(peripheralId, serviceUUID, characteristicUUID) {//根据指定的特征启动通知,您需要先调用retrieveServices方法
    BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID)
      .then(() => {
        // Success code
        console.log('Notification started');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  stopNotification(peripheralId, serviceUUID, characteristicUUID) {//停止指定特征的通知
    BleManager.stopNotification(peripheralId, serviceUUID, characteristicUUID)
      .then(() => {
        // Success code
        console.log('Notification stop');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  read(peripheralId, serviceUUID, characteristicUUID) {//读取指定特性的当前值,需要先调用retrieveServices方法
    BleManager.read(peripheralId, serviceUUID, characteristicUUID)
      .then((readData) => {
        // Success code
        console.log('Read: ' + readData);

        const buffer = Buffer.Buffer.from(readData);    //https://github.com/feross/buffer#convert-arraybuffer-to-buffer
        const sensorData = buffer.readUInt8(1, true);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  write(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize) { //data 为 bytes => stringToBytes   用指定特征写入响应,需要先调用retrieveServices方法。
    BleManager.write(peripheralId, serviceUUID, characteristicUUID, data)
      .then(() => {
        // Success code
        console.log('Write: ' + data);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize, queueSleepTime) {//写入没有响应指定的特征,你需要先调用retrieveServices方法
    BleManager.writeWithoutResponse('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', data)
      .then(() => {
        // Success code
        console.log('Writed: ' + data);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  readRSSI(peripheralId) {//读取RSSI的当前值。
    BleManager.readRSSI(peripheralId)
      .then((rssi) => {
        // Success code
        console.log('Current RSSI: ' + rssi);
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  requestMTU(peripheralId, mtu) {//请求用于给定连接的MTU大小
    BleManager.requestMTU(peripheralId, mtu)
      .then(() => {
        // Success code
        console.log('MTU size changed');
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }
  retrieveServices(peripheralId) {//检索外设的服务和特征
    BleManager.retrieveServices(peripheralId)
      .then((peripheralInfo) => {
        // Success code
        console.log('Peripheral info:', peripheralInfo);
      });
  }
  getConnectedPeripherals() {//返回连接的外围设备
    BleManager.getConnectedPeripherals([])
      .then((peripheralsArray) => {
        // Success code
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
  }
  createBond(peripheralId) {//开始与远程设备的绑定（配对）过程。 andriod
    BleManager.createBond(peripheralId)
      .then(() => {
        console.log('createBond success or there is already an existing one');
      })
      .catch(() => {
        console.log('fail to bond');
      })
  }
  getBondedPeripherals() {
    BleManager.getBondedPeripherals([])
      .then((bondedPeripheralsArray) => {
        // Each peripheral in returned array will have id and name properties
        console.log('Bonded peripherals: ' + bondedPeripheralsArray.length);
      });

  }
  getDiscoveredPeripherals() { //返回搜索到的设备
    BleManager.getDiscoveredPeripherals([])
      .then((peripheralsArray) => {
        // Success code
        console.log('Discovered peripherals: ' + peripheralsArray.length);


        this.setState({
          list:peripheralsArray
        })
      });
  }
  removePeripheral(peripheralId) {
    BleManager.isPeripheralConnected(peripheralId, [])
      .then((isConnected) => {
        if (isConnected) {
          console.log('Peripheral is connected!');
        } else {
          console.log('Peripheral is NOT connected!');
        }
      });
  }
  componentWillUnmount() {

  }



  render() {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableHighlight style={{ marginTop: 0, margin: 20, padding: 20, backgroundColor: '#ccc' }} onPress={()=>{ this.startScan()}}   ><Text>搜索({this.state.scanning ? 'no' :'off'})</Text></TouchableHighlight>
          <TouchableHighlight style={{ marginTop: 0, margin: 20, padding: 20, backgroundColor: '#ccc' }}><Text>查看已连接</Text></TouchableHighlight>
          <TouchableHighlight style={{ marginTop: 0, margin: 20, padding: 20, backgroundColor: '#ccc' }}><Text>查看</Text></TouchableHighlight>
        </View>
        <ScrollView>
        <Text>{JSON.stringify(this.state.list)}</Text>

        </ScrollView>
        <ScrollView>
          <Text>{this.state.infos}</Text>
        </ScrollView>
        <ScrollView>
          <Text>{this.state.infos}123</Text>
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
