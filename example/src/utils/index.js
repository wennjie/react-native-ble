import { stringToBytes, bytesToString } from 'convert-string';

export default class Utils {
    constructor() {
        this.ag = [35, 0, 0, 0, 8, 0, 0, 0, 24, 0, 0, 0, 24, 36, 71, 80, 71, 71, 65, 44, 44, 44, 44, 44, 44, 48, 44, 44, 44, 44, 44, 44, 44, 44, 42, 54, 54, 64]
    }
    RequestZore(place) {
        let n = 0
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
    Bytes2Data(v, data) {

        if (data) {

        } else {
            return [...stringToBytes('#'), ...this.Int2bytes(this.RequestZore(v)), ...this.Int2bytes(0), ...this.Int2bytes(0), ...stringToBytes('@')]
        }
    }
    judgePattern(bytes) {
        let len = bytes.length
        if (bytes[0] != 35 && bytes[len - 1] != 64) return

        let byt32_1 = bytes.slice(1, 5)
        let byt32_2 = bytes.slice(5, 9)
        let int32_1 = this.Bytes2int321(byt32_1)
        let int32_2 = this.Bytes2int321(byt32_2)
        console.log('len:'+int32_2)

        let w1 = int32_1 & 0x3

        let w2 = int32_1 >> 2

        let buf = bytes.slice(13, len-1)

        // translateDatas
        let bytes1 = this.translateDatas(buf)

        let s = bytesToString(bytes1) //TODO  可能存在问题
        
        
        console.log(s)
        console.log(s.length)
        if (w1 == 0) {
            switch (w2) {
                case 1:
                    break;
                case 2: //GGA

                    if (int32_2 == s.length) {
                        console.log(s)
                        let s2 = s.split(',')
                        let hashMap={}
                        let lat,lon,satellites,rtk,hdop,alt
                        if(s2[3]=='N'){
                            lat = this.gpsToGoogler(s2[2]);
                        }else{
                            lat = -(this.gpsToGoogler(s2[2]));
                        }
                        if(s2[5]=='E'){
                            lon = this.gpsToGoogler(s2[4]);
                        }else{
                            lon = -(this.gpsToGoogler(s2[4]));
                        }

                        hashMap.satellites=s2[7]
                        hashMap.rtk=s2[6]
                        hashMap.hdop=s2[8]
                        hashMap.lon=lon
                        hashMap.lat=lat
                        hashMap.alt=s2[9]
                        


                        return hashMap


                        //TODO  解析GGA
                    }


                    break;
                case 4:

                    break;

                case 8:

            }
        }

    }
    translateDatas(v) { // translateDatas

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
    gpsToGoogler(v){//转换经纬度HH.DD.MM格式
        let i = v.indexOf('.')
        let substring = v.substring(0,i-3)
        let substring1 = v.substring(i-3,v.length)
        return Math.abs(substring+Math.abs(substring1)/60)
    }

}