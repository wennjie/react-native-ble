import React, { Component } from 'react';
import { AppRegistry, TouchableWithoutFeedback,StatusBar, View, Text ,StyleSheet , Image ,ToastAndroid ,Alert} from 'react-native';
import { Button ,List} from 'antd-mobile';
const Item = List.Item;

const Brief = Item.Brief;

export default class Login extends Component {
    constructor(props){
        super(props)
        this.state={
            versions:'1.0.12',
            pattern:'手持张',//模式
            state:'',//状态
            channel:0,//通道号
            levelOfAccuracy:'',//水平精度
            rtkState:'',
            accountState:'',
            lat:'',
            lng:'',
            height:''
        }
    }
    openSetting(info){
       console.log(this)
       alert(123)
       this.setState({

       })
    }
    render() {
        const ListHeader=(info) => (
            <TouchableWithoutFeedback onPress={()=>{
                this.openSetting(info)
            }}>
            <View  style={styles.rowTitle}>
                <Text style={styles.titleL}>{info}</Text>
                <Text style={styles.titleR}>设置</Text>
            </View>
            </TouchableWithoutFeedback>
            )
        const State=this.state
        return(
        <View style={styles.view}>
            {/* <StatusBar style={{height:30}}/> */}
           <View>
               <Text>版本号：{this.state.versions}</Text>
               <Text>icon</Text>
           </View>
           <View>
               <Text>图片文字</Text>
           </View>
           <View >
           <List renderHeader={() => ListHeader('基本状态')}>
           <Item extra={State.pattern}   >工作模式</Item>
           <Item extra={State.state}  >工作状态</Item>
           <Item extra={State.channel}  >通道号</Item>
           </List>
           <List renderHeader={() => ListHeader('定位状态')}>
           <Item extra={State.levelOfAccuracy}  onClick={()=>{this.openSetting()}}>水平精度</Item>
           <Item extra={State.rtkState}  >RTK状态</Item>
           <Item extra={State.accountState}  >结算状态</Item>
           <Item extra={State.lat}  >经度</Item>
           <Item extra={State.lng}  >纬度</Item>
           <Item extra={State.height}  >高程</Item>
           </List>
           </View>
        </View>
        )}
}
const styles = StyleSheet.create({
    view:{
        paddingTop:20,
        
    },
    rowTitle:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height:30,
        backgroundColor:'#e5e5e5',
    },
    titleL:{
        paddingLeft:20
    },
    titleR:{
        paddingRight:20,
        color:'#71C671'
    },
    font:{
        fontSize:16,
        color:'red'
    }

    
  });