import React, { Component } from 'react';
import { AppRegistry, TouchableWithoutFeedback, StatusBar, View, Text, StyleSheet, Image, ToastAndroid, Alert,NativeEventEmitter,NativeModules, } from 'react-native';
import { Button, List } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const Item = List.Item;
const Brief = Item.Brief;
export default class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            versions: '1.0.12',
            pattern: '手持张',//模式
            state: '',//状态
            channel: 0,//通道号
            levelOfAccuracy: '',//水平精度
            rtkState: '',
            accountState: '',
            lat: '',
            lng: '',
            height: ''
        }
    }
    componentDidMount(){
        console.log('home1')
    }
    componentWillMount() {
      
        console.log('home')
        BleManager.enableBluetooth().then(() => { //Android only
            //TODO ,启用成功
            BleManager.start({ showAlert: false }).then((e) => {
                console.log('蓝牙服务打开???')
                })
        }).catch((error) => {
            //TODO,启用失败
        });
        

        return 
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
    componentWillUnmount() {
       console.log('路由切换')
      }
    handleAppStateChange(nextAppState) {//切换后台后 前台
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
          console.log('App已经到了前台!')
          BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
            console.log('连接外围设备: ' + peripheralsArray.length + '个');
          });
        }
        this.setState({ appState: nextAppState });
      }

    openSetting(info) {
        const navigator = this.props.navigator;
        let title = ''
        switch (info) {
            case '基本状态': title = 'basicSetting'
                break;
            case '定位状态': title = 'locationSetting'
                break;
            case '': title = 'bleView'
                break;

        }
        navigator.push({
            screen: title,
            title: title,
        });

    }
    render() {
        const ListHeader = (info) => (
            <TouchableWithoutFeedback onPress={() => {
                this.openSetting(info)
            }}>
                <View style={styles.rowTitle}>
                    <Text style={styles.titleL}>{info}</Text>
                    <Text style={styles.titleR}>设置</Text>
                </View>
            </TouchableWithoutFeedback>
        )
        const State = this.state
        return (
            <View style={styles.view}>
                
                <TouchableWithoutFeedback onPress={() => { this.openSetting('') }}>
                    <View style={styles.header} >
                        <Image
                            style={styles.headerImage}
                            source={{
                                uri: 'http://pic.sc.chinaz.com/files/pic/pic9/201803/zzpic10964.jpg',
                                cache: 'force-cache'
                            }}
                        />
                        <Text  >图片文字1</Text>
                    </View>
                </TouchableWithoutFeedback>
                <View >
                    <List renderHeader={() => ListHeader('基本状态')}>
                        <Item extra={State.pattern}   >工作模式</Item>
                        <Item extra={State.state}  >工作状态</Item>
                        <Item extra={State.channel}  >通道号</Item>
                    </List>
                    <List renderHeader={() => ListHeader('定位状态')}>
                        <Item extra={State.levelOfAccuracy}>水平精度</Item>
                        <Item extra={State.rtkState}  >RTK状态</Item>
                        <Item extra={State.accountState}  >结算状态</Item>
                        <Item extra={State.lat}  >经度</Item>
                        <Item extra={State.lng}  >纬度</Item>
                        <Item extra={State.height}  >高程</Item>
                    </List>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 0, width: 375 }}>
                    <Text>版本号：{this.state.versions}</Text>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        paddingTop: 20,
        flex: 1

    },
    rowTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        backgroundColor: '#e5e5e5',
    },
    titleL: {
        paddingLeft: 20
    },
    titleR: {
        paddingRight: 20,
        color: '#71C671'
    },
    font: {
        fontSize: 16,
        color: 'red'
    },
    headerImage: {
        height: 60,
        width: 60,

    },
    header: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        // marginTop: 30
    }


});