import React, { Component } from 'react';
import { AppRegistry, Platform, TouchableWithoutFeedback, DeviceEventEmitter, StatusBar, View, Text, StyleSheet, Image, ToastAndroid, Alert, NativeEventEmitter, NativeModules, } from 'react-native';
import { Button, List ,Toast } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
import Utils from '../../utils'
const Util = new Utils()
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const Item = List.Item;

s = 100.1 + "," + 20.3 + "," + 1 + ","

console.log(Util.Bytes2Data(2, Util.String2byte(s)))
export default class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            versions: '1.0.12',
            pattern: '',//模式
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
            GGA: {}
        }
        this.arr = [],
            this.bleService = {}
    }
    componentDidMount() {
        let ag = [35, 0, 0, 0, 8, 0, 0, 0, 24, 0, 0, 0, 24, 36, 71, 80, 71, 71, 65, 44, 44, 44, 44, 44, 44, 48, 44, 44, 44, 44, 44, 44, 44, 44, 42, 54, 54, 64]
        console.log(Util.judgePattern(ag))
        // this.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(2, [6]))
                console.log(Util.Bytes2Data(2,Util.String2byte('6')))
        BleManager.start({ showAlert: true }) //开启服务
        this.listener = DeviceEventEmitter.addListener('RETURNUUIDS', (peripheral) => {
            console.log(peripheral)
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                console.log(`搜索到的服务`);
                // console.log(peripheralInfo)

                let characteristics = peripheralInfo.characteristics  //特征

                let pId = peripheralInfo.id
                let data = Util.Bytes2Data

                characteristics.map((i) => {
                    // console.log(i)
                    if (i.characteristic.toLowerCase() == 'fff6') {
                        this.bleService = { pId, services: i.service, characteristics: i.characteristic }
                        this.startNotification(pId, i.service, i.characteristic)//开启监听

                        //请求数据接口
                        // return 
                        setInterval(() => {
                //             this.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(2, [6]))
                // console.log(Util.Bytes2Data(2,[6]))
                // return 
                            setTimeout(() => {
                                this.writeWithoutResponse(pId, i.service, i.characteristic, Util.Bytes2Data(4))
                            }, 100)
                            setTimeout(() => {
                                this.writeWithoutResponse(pId, i.service, i.characteristic, Util.Bytes2Data(2))
                            }, 200)
                            setTimeout(() => {
                                this.writeWithoutResponse(pId, i.service, i.characteristic, Util.Bytes2Data(5))
                            }, 300)
                            this.writeWithoutResponse(pId, i.service, i.characteristic, Util.Bytes2Data(3))

                        }, 2000)
                        // setInterval(() => {
                        //     
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



                    let res = Util.judgePattern(this.arr)

                    console.log(res)
                    // return 
                    if (res.info == 'GGA') {
                        this.setState({
                            GGA: res.val
                        })
                        return
                    }
                    if (res.info == '信道') {
                        this.setState({
                            channel: res.val
                        })
                        return
                    }
                    if (res.info == '系统状态') {
                        this.setState({
                            pattern: res.val
                        })
                        return
                    }
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

    startNotification(pId, service, characteristic) {
        BleManager.startNotification(pId, service, characteristic).then((res) => {
            console.log('监听开启成功')

        }).catch((error) => {
            console.log('监听开启失败');
        });
    }
    writeWithoutResponse(pId, service, characteristic, data) {
        BleManager.writeWithoutResponse(pId, service, characteristic, data).then((res)=>{
            console.log(res)
        })
    }
    openSetting(info) {
        console.log(info)
        let service, { pId, services, characteristics } = this.bleService
        const navigator = this.props.navigator;
        let title = '', screen = ''
        switch (info) {
            case '基本状态': title = '设备模式'; screen = 'basicSetting'
                if (JSON.stringify(service) == "{}") {
                    alert('未连接')
                    return
                }
                break;
            case '定位状态': title = '定位设置'; screen = 'locationSetting'
            //信道设置
            
            // this.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(4))
   
            if (JSON.stringify(service) == "{}") {
                    alert('未连接')
                    return
                }
                if (this.state.GGA.rtk != 4) {
                    alert('数据不正常')
                    return
                }
                break;

            case '': title = '蓝牙选择'; screen = 'bleView'
                break;

        }

        navigator.push({
            screen,
            title,
            passProps: {
                service,
                channel:this.state.channel,
                pattern:this.state.pattern
            }
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
        console.log(State.GGA)
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
                        {/* <Text  >{
                            this.state.res
                        }</Text> */}
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
                        <Item extra={State.GGA.hdop}>水平精度</Item>
                        <Item extra={State.GGA.rtk}  >RTK状态</Item>
                        <Item extra={State.GGA.rtk == 4 ? '正常' : ""}  >结算状态</Item>
                        <Item extra={State.GGA.lat}  >经度</Item>
                        <Item extra={State.GGA.lon}  >纬度</Item>
                        <Item extra={State.GGA.alt}  >高程</Item>
                    </List>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 10, width: 375 }}>
                    <Text style={{ fontSize: 8 }}>版本号：{this.state.versions}</Text>
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
        padding: 40,
    }


});