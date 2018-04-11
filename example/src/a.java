if (data != null && data.length > 0) {
    //                final StringBuilder stringBuilder = new StringBuilder(data.length);
    //                for (byte byteChar : data) {
    //                    //以十六进制的形式输出
    //                    stringBuilder.append(String.format("%02X ", byteChar));
    //                }
                    try {
                        for (int i = 0; i < data.length; i++, bNo++) {
                            if (data[i] == 35) {
                                bDatas = new byte[1024];
                                bNo = 0;
                                bDatas[bNo] = data[i];
                            } else if (data[i] == 64) {
                                bDatas[bNo] = data[i];
                                judgePattern(bDatas, bNo, action);
                            } else {
                                bDatas[bNo] = data[i];
                            }
                        }
                    } catch (Exception e) {
                        sjj.alog.Log.e("", e);
                        bDatas = new byte[1024];
                    }
    
    //                intent.putExtra(EXTRA_DATA, data);   //新设备
    //                sendBroadcast(intent);
    
                }