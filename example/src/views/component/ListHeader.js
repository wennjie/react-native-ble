import React, { Component } from 'react';
import { AppRegistry, StatusBar, View, Text, StyleSheet, Image, ToastAndroid, Alert } from 'react-native';
import { Button, List } from 'antd-mobile';
const Item = List.Item;

const Brief = Item.Brief;

export default class ListHeader extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    openSetting(info) {

    }
    render() {

        const State = this.state
        return (
            <View style={styles.rowTitle} onClick={()=>{alert(1)}}>
                <Text style={styles.titleL}>{this.props.info}</Text>
                <Text style={styles.titleR}>设置</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({

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
    }


});