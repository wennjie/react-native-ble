import React, { Component } from 'react';
import { View, Text, NativeModules, NativeEventEmitter, DeviceEventEmitter, StyleSheet } from 'react-native';
import { List, Radio, Button, Toast } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
import Utils from '../../utils';
const Util = new Utils();
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const Item = List.Item;
const RadioItem = Radio.RadioItem;

Toast.info(123)

export default class BasicSetting extends Component {
    constructor(porps) {
        super(porps)
        this.state = {
            value: porps.pattern == '基站' ? 1 : 0,
            btArr: [0, 1, 2, 3, 4, 5, 6, 7],
            index: porps.channel,
            service: porps.service
        }
        console.log(porps.channel)
        this.eventIndex = {xd:0,qh:0}

    }
    componentDidMount() {
        this.listener = DeviceEventEmitter.addListener('setInfos', (info) => {

            console.log(info)


            switch (info) { //判断info 的值,确认是否完成
                case 1:  //信道设置成功

                    Toast.hide()
                    Toast.info('信道设置成功')

                    this.setState({
                        index:this.eventIndex.xd
                    })

                    break;

                case 2:  //切换成功
                    Toast.hide()
                    Toast.info('模式切换成功')
                    this.setState({
                        index:this.eventIndex.qh
                    })
                    break;


            }

        })
    }
    componentWillUnmount() {
        this.listener.remove()
        Toast.hide()
    }
    onChange(value) {

        if (value == this.state.value) return

        this.eventIndex.qh=value

       

        let { pId, services, characteristics } = this.state.service
        
        BleManager.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(3, [value])).then(()=>{
            Toast.loading('工作模式切换中...', 0)
        }).catch(()=>{
            console.log('失败了？')
        })
       

        this.setState({
            value,

        });
    }
    btClick(v) {
        if (v == this.state.index) return
        this.eventIndex.xd=v
       
        let { pId, services, characteristics } = this.state.service

        console.log(pId, services, characteristics)

        BleManager.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(2, Util.String2byte(v + ''))).then((res) => {
            Toast.loading('信道切换中...', 0)
        }).catch(()=>{
            console.log('失败了？')
        })


        // this.setState({
        //     index:v
        // })

    }
    render() {
        const data = [{ value: 1, label: '基站模式' }, { value: 0, label: '手持仗模式' }]
        const { value, btArr } = this.state

        return (
            <View>
                <List renderHeader={() => '工作模式'}>
                    {data.map(i => (
                        <RadioItem key={i.value} checked={value === i.value} onChange={() => this.onChange(i.value)}>
                            {i.label}
                        </RadioItem>
                    ))}
                </List>
                <List renderHeader={() => '通道设置'} >
                    <View style={styles.btContent}>
                        {

                            btArr.map((i, index) => {
                                let color = this.state.index == i ? 'red' : '#fff'
                                return <Button key={i} onClick={() => { this.btClick(i) }} style={[styles.btArr, { 'backgroundColor': color }]}>{i}</Button>
                            })
                        }
                    </View>
                </List>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    btArr: {
        width: 75,
        margin: 5
    },
    btContent: {
        flexDirection: 'row',
        alignItems: 'stretch',
        padding: 15,
        flexWrap: 'wrap',
    }

})