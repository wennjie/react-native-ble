import React, { Component } from 'react';
import { AppRegistry, Platform, TouchableWithoutFeedback, DeviceEventEmitter, StatusBar, View, Text, StyleSheet, Image, ToastAndroid, Alert, NativeEventEmitter, NativeModules, } from 'react-native';
import { Button, List } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
import Utils from '../../utils'
const Util = new Utils()
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const Item = List.Item;

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
            height: '',
            res: '蓝牙',
            ress: "蓝牙",
            judgePattern:{}
        }
        this.arr = []
    }
    componentDidMount() {
        let ag = [35, 0, 0, 0, 8, 0, 0, 0, 24, 0, 0, 0, 24, 36, 71, 80, 71, 71, 65, 44, 44, 44, 44, 44, 44, 48, 44, 44, 44, 44, 44, 44, 44, 44, 42, 54, 54, 64]
        // console.log(Util.judgePattern(ag))
        BleManager.start({ showAlert: true }) //开启服务
        this.listener = DeviceEventEmitter.addListener('RETURNUUIDS', (peripheral) => {
            console.log(peripheral)
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                console.log(`搜索到的服务`);
                console.log(peripheralInfo)

                let characteristics = peripheralInfo.characteristics  //特征

                let pId = peripheralInfo.id
                let data = Util.Bytes2Data(3),data1=Util.Bytes2Data(4)

                characteristics.map((i) => {
                    console.log(i)
                    if (i.characteristic.toLowerCase() == 'fff6') {
                        this.startNotification(pId, i.service, i.characteristic)//开启监听

                        //请求数据接口

                        setInterval(() => {
                           this.writeWithoutResponse(pId, i.service, i.characteristic,data)

                        }, 1000)
                        // setInterval(() => {
                        //     this.writeWithoutResponse(pId, i.service, i.characteristic,data1)
                            
                        // }, 8000)

                    }

                })





            });
        });
        this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
        this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic.bind(this));


    }
    componentWillUnmount() {
        console.log('路由切换')
    }

    handleDisconnectedPeripheral(data) {

        console.log('断开了 ' + data.peripheral);
    }
    handleUpdateValueForCharacteristic(data) { //监听返回的值
        let datas = data.value
        datas.map((i) => {
            switch (i) {
                case 35:
                    this.arr = []
                    this.arr.push(i)
                    break;
                case 64:
                    this.arr.push(i)
                    console.log(Util.judgePattern(this.arr))

                    this.setState({
                        judgePattern: Util.judgePattern(this.arr)
                    })
                    break;
                default:
                    this.arr.push(i)
            }
        })
    }

    handleStopScan() {
        console.log('搜索结束');
        this.setState({ scanning: false });
    }

    startNotification(pId, service, characteristic){
        BleManager.startNotification(pId, service, characteristic).then((res) => {
            console.log('监听开启成功')

        }).catch((error) => {
            console.log('监听开启失败');
        });
    }
    writeWithoutResponse(pId, service, characteristic,data){
        BleManager.writeWithoutResponse(pId, service, characteristic, data)
    }
    openSetting(info) {
        const navigator = this.props.navigator;
        let title = '', screen = ''
        switch (info) {
            case '基本状态': title = 'index'; screen = ''
                break;
            case '定位状态': title = 'index'; screen = ''
                break;
            case '': title = 'bleView'; screen = '蓝牙选择'
                break;

        }
        navigator.push({
            screen: title,
            title: screen,
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
        console.log(State.judgePattern)
        return (
            <View style={styles.view}>

                <TouchableWithoutFeedback onPress={() => { this.openSetting('') }}>
                    <View style={styles.header} >
                        {/* <Image
                            style={styles.headerImage}
                            source={{
                                uri: 'http://pic.sc.chinaz.com/files/pic/pic9/201803/zzpic10964.jpg',
                                cache: 'force-cache'
                            }}
                        /> */}
                        <Text  >{
                            this.state.res
                        }</Text>
                        <Text  >{
                            this.state.ress
                        }</Text>
                    </View>
                </TouchableWithoutFeedback>
                <View >
                    <List renderHeader={() => ListHeader('基本状态')}>
                        <Item extra={State.pattern}   >工作模式</Item>
                        <Item extra={State.state}  >工作状态</Item>
                        <Item extra={State.channel}  >通道号</Item>
                    </List>
                    <List renderHeader={() => ListHeader('定位状态')}>
                        <Item extra={State.judgePattern.hdop}>水平精度</Item>
                        <Item extra={State.judgePattern.rtk}  >RTK状态</Item>
                        <Item extra={State.judgePattern.satellites}  >结算状态</Item>
                        <Item extra={State.judgePattern.lat}  >经度</Item>
                        <Item extra={State.judgePattern.lon}  >纬度</Item>
                        <Item extra={State.judgePattern.alt}  >高程</Item>
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