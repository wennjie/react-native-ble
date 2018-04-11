private void judgePattern(byte[] bytes, int lengh, String action) {
    byte[] datas = Arrays.copyOf(bytes, lengh + 1);
//        Log.e(Arrays.toString(datas)  +"\n"+new String(datas));
    if (datas[0] == 35 && datas[datas.length - 1] == 64) { //判断头尾  
        byte[] byt321 = Arrays.copyOfRange(datas, 1, 5); //请求命令
        byte[] byte322 = Arrays.copyOfRange(datas, 5, 9);//未转义的长度
        //转成int


        int int321 = Int2Byte.byteArrayToInt(byt321);
        int int322 = Int2Byte.byteArrayToInt(byte322);

        int w1 = int321 & 0x3;
        
        int w2 = int321 >> 2;

        byte[] buf = Arrays.copyOfRange(datas, 13, datas.length - 1);
        byte[] bytes1 = Int2Byte.translateDatas(buf);
        String s = new String(bytes1, 0, bytes1.length);
//            Log.e(w1+"   "+w2);

        if (is_test) {
        /*
        * 测试专用方法
        * */
            byte[] cs_byt = Arrays.copyOfRange(datas, 22, datas.length);
//            Log.e(Arrays.toString(cs_byt));
            if (cs_byt[0] == 36 && cs_byt[cs_byt.length - 1] == 64) {
                getGGan(cs_byt, action);
            }
        } else {
        /*
        * 正式方法
        * */
            if (w1 == 0) {    //请求模式
                switch (w2) {
                    case 1:     //id
                        break;
                    case 2:      //gga
                        if (int322 == s.length()) {
                            HashMap<String, String> HashMap = AnalysisGGAUtil.analysisGGA(s);
                            if (HashMap == null) {
//                                    sjj.alog.Log.e("HashMap    null");
                                ggaBan.setGGAEmpty();
                            } else {
                                sjj.alog.Log.e("HashMap    " + HashMap.toString());
                                ggaBan.setDatas(HashMap);
                            }

                            Intent intent = new Intent(action);