import React, { Component } from 'react';
import { View, Text, NativeModules, NativeEventEmitter, DeviceEventEmitter, StyleSheet } from 'react-native';
import { List, Radio, Button } from 'antd-mobile';
import BleManager from 'react-native-ble-manager';
import Utils from '../../utils';
const Util = new Utils();
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const Item = List.Item;
const RadioItem = Radio.RadioItem;

export default class BasicSetting extends Component {
    constructor(porps) {
        super(porps)
        this.state = {
            value:porps.pattern == '基站' ? 1 : 0 ,
            btArr: [0, 1, 2, 3, 4, 5, 6, 7],
            index:porps.channel,
            service:porps.service
        }
        console.log(porps.channel)

    }
    onChange(value) {
        let {pId, services, characteristics } = this.state.service
        if(value==this.state.value) return 
        
        BleManager.writeWithoutResponse(pId, services, characteristics, [value]).then((res)=>{
            console.log(res)
        })
        //  this.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(2, Util.String2byte("5")))
        this.writeWithoutResponse(pId, services, characteristics, Util.Bytes2Data(3, [0]))

        this.setState({
            value,
           
        });
    }
    btClick(v) {
        if(v==this.state.index) return 
        let {pId, services, characteristics } = this.state.service

        BleManager.writeWithoutResponse(pId, services, characteristics,  Util.Bytes2Data(2, Util.String2byte(v))).then((res)=>{
            console.log(res)
        })
        
        
        this.setState({
            index:v
        })

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
                                let color = this.state.index == i ? 'red' :'#fff'
                                return <Button key={i} onClick={() => { this.btClick(i) }} style={[styles.btArr, { 'backgroundColor': color}]}>{i}</Button>
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