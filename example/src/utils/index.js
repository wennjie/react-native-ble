import { stringToBytes, bytesToString } from 'convert-string';
import { Toast } from 'antd-mobile';
export default class Utils {
    constructor() {
        this.ag = [35, 0, 0, 0, 8, 0, 0, 0, 24, 0, 0, 0, 24, 36, 71, 80, 71, 71, 65, 44, 44, 44, 44, 44, 44, 48, 44, 44, 44, 44, 44, 44, 44, 44, 42, 54, 54, 64]
    }
    RequestGetZore(place) { //返回获取信息的int
        let n = 0
        n |= (1 << place)
        return n
    }
    RequestSetZore(place) { //返回设置信息的int
        let n = 0
        n |= (1 << 0)
        n |= (1 << place)
        return n
    }
    Int2bytes(v) {
        let i0 = (v >> 24) & 0xff
        let i1 = (v >> 16) & 0xff
        let i2 = (v >> 8) & 0xff
        let i3 = (v >> 0) & 0xff
        return [i3, i0, i1, i2]
    }
    Bytes2int32(v) {
        return ((v[0] & 0xff) << 0) | ((v[1] & 0xff) << 16) | ((v[2] & 0xff) << 8) | ((v[3] & 0xff) << 24)
    }
    Bytes2int321(v) {
        return ((v[0] & 0xff) << 24) | ((v[1] & 0xff) << 16) | ((v[2] & 0xff) << 8) | ((v[3] & 0xff) << 0)
    }
    String2byte(v) {
        return stringToBytes(v)
    }
    Bytes2string(v) {
        return bytesToString(v)
    }
    Bytes2Data(v, bytes) {  //3 请求GGA  ,4 请求信道，2 请求id ,5 请求工作状态

        //设置  基站手持杖切换  3 data [0],[1]
        //经纬度高度写入 6 data ：str s = lat + "," + lon + "," + alt + ",";
        // 信道 2 data str 类型额 0-7
        console.log(v, bytes)
        if (bytes) {

            let len = bytes.length
            let translation = this.translationAanEnd(bytes)
            return [...stringToBytes('#'), ...this.Int2bytes(this.RequestSetZore(v)), ...this.Int2bytes(len), ...this.Int2bytes(translation.length), ...translation, ...stringToBytes('@')]

        } else {
            return [...stringToBytes('#'), ...this.Int2bytes(this.RequestGetZore(v)), ...this.Int2bytes(0), ...this.Int2bytes(0), ...stringToBytes('@')]
        }
    }
    judgePattern(bytes) {
        let len = bytes.length
        if (bytes[0] != 35 && bytes[len - 1] != 64) return

        let byt32_1 = bytes.slice(1, 5)
        let byt32_2 = bytes.slice(5, 9)
        let int32_1 = this.Bytes2int321(byt32_1)
        let int32_2 = this.Bytes2int321(byt32_2)
        console.log('len:' + int32_2)

        let w1 = int32_1 & 0x3

        let w2 = int32_1 >> 2

        let buf = bytes.slice(13, len - 1)

        // translateDatas
        let bytes1 = this.translateDatas(buf)

        console.log(bytes1)
        let s = bytesToString(bytes1) //TODO  可能存在问题


        console.log(s)
        console.log(s.length)
        if (w1 == 0) { //请求模式
            switch (w2) {
                case 1:
                    return { info: '', val: '' }
                    break;
                case 2: //GGA

                    if (int32_2 == s.length) {
                        console.log(s)
                        let s2 = s.split(',')
                        let hashMap = {}
                        let lat, lon, satellites, rtk, hdop, alt
                        if (s2[3] == 'N') {
                            lat = this.gpsToGoogler(s2[2]);
                        } else {
                            lat = -(this.gpsToGoogler(s2[2]));
                        }
                        if (s2[5] == 'E') {
                            lon = this.gpsToGoogler(s2[4]);
                        } else {
                            lon = -(this.gpsToGoogler(s2[4]));
                        }

                        hashMap.satellites = s2[7]
                        hashMap.rtk = s2[6]
                        hashMap.hdop = s2[8]
                        hashMap.lon = lon
                        hashMap.lat = lat
                        hashMap.alt = s2[9]
                        return { info: 'GGA', val: hashMap }
                        //TODO  解析GGA
                    }


                    break;
                case 4: //信道in
                    if (bytes1.length == 1) {
                        return { info: '信道', val: bytes1[0] }
                    }
                    break;

                case 8: //系统状态

                    // return 
                    let b = bytes1[0] & 0xff | (bytes1[1] & 0xff) << 8 | (bytes1[2] & 0xff) << 16 | (bytes1[3] & 0xff) << 24
                    let q = b & 0x3
                    let w = (b >> 2) & 0x3
                    let e = (b >> 4) & 0x63
                    let infos = ''
                    switch (q) {
                        case 0:     //手持杖
                            //sjj.alog.Log.e("手持杖");
                            //ggaBan.setWorkmoder("手持杖");
                            infos = "手持杖";
                            break;
                        case 1: //基站
                            //sjj.alog.Log.e("基站");
                            //ggaBan.setWorkmoder("基站");
                            infos = "基站";
                            break;
                        case 2:       //切换中
                            //sjj.alog.Log.e("切换中");
                            //ggaBan.setWorkmoder("切换中");
                            infos = "切换中";
                            break;
                        case 3://切换中
                            //sjj.alog.Log.e("无状态");
                            //ggaBan.setWorkmoder("无状态");
                            infos = "无状态";
                            break;
                    }
                    // switch (w) {
                    //     case 0:      //已经正常工作
                    //         //                                    ggaBan.setWorkstate("正常");
                    //         break;
                    //     case 1:        //初始化中
                    //         //                                    ggaBan.setWorkstate("初始化中");
                    //         break;
                    //     case 2:     //无
                    //         //                                    ggaBan.setWorkstate("无");
                    //         break;
                    //     case 3:    //无
                    //         //                                    ggaBan.setWorkstate("无");
                    //         break;
                    // }
                    return { info: '系统状态', val: infos }
                    break;

            }
        } else if (w1 == 2) {  //设置模式
            
            let infos=''

            switch (w2) {
                case 1:
                    //                            Log.e("信道");
                Toast.loading("信道发送成功，正在设置")

                    break;
                case 2:
                    //                            Log.e("基站手持杖切换");
                    Toast.loading("基站手持杖切换发送成功，正在设置");
                    break;
                case 4:
                    //                            Log.e("rtcm数据");
                    Toast.loading("rtcm数据发送成功，正在设置");
                    break;
                case 8:
                    //                            Log.e("rtk自矫正");
                    Toast.loading("rtk自矫正发送成功，正在设置");
                    break;
                case 16:
                    //                            Log.e("设置经纬度");
                    Toast.loading("设置经纬度发送成功，正在设置");
                    break;
            }
            return { info: "", val: '' }

        }


    }
    translateDatas(v) { // translateDatas 反转义

        let arr = []
        v.map((i, index) => {

            if (i == 0x7d) {
                v[index + 1] = v[index + 1] ^ 0x20
            } else {
                arr.push(i)
            }
        })

        return arr

    }
    translationAanEnd(bytes) { //转义
        console.log('1' + bytes)
        let len = bytes.length
        let arr = []
        bytes.map((i) => {
            if (i == 35 | i == 0x7d | i == 0x64) {
                let i1 = i ^ 0x20
                arr.push(0x7d)
                arr.push(i1)
            } else {
                arr.push(i)
            }
        })
        console.log(arr)
        return arr
    }
    gpsToGoogler(v) {//转换经纬度HH.DD.MM格式
        let i = v.indexOf('.')
        let substring = v.substring(0, i - 3)
        let substring1 = v.substring(i - 3, v.length)
        return Math.abs(substring + Math.abs(substring1) / 60)
    }

}