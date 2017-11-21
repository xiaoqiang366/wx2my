# wx2my
微信小程序转化支付宝小程序

### Javascript转换
* 基础API类
    * [`login`][wx-login]  => [`getAuthCode`][my-login]
    * `wx.saveFile`暂不支持
    * `wx.saveVideoToPhotosAlbum()`暂不支持
    * `wx.getImageInfo()`暂不支持
    * `getUserInfo` --> `getAuthUserInfo`
    * `startPullDownRefresh`暂不支持
    * **`wx.showModal`** -> **`my.confirm`**, 使用`my.alert()/my.confirm()` 来完成模态对话框的功能[参考][my-modal]
    * `showToast` 参数不同， [参考][my-modal]
    * `wx.openDocument()`不支持
    * `getLocation` 参数不同，返回值不同。[参考][my-location]
    * `wx.drawCanvas()` 已经废弃，请使用 `my.createCanvasContext & canvas.draw` 来迁移
    * `my.createCanvasContext()` 需要传入 canvas id 作为入参，请适配下
  

[wx-login]: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html#wxloginobject
[my-login]: https://docs.alipay.com/mini/introduce/auth#22-%E5%AE%A2%E6%88%B7%E7%AB%AF%E8%8E%B7%E5%8F%96authcode
[my-modal]: https://docs.alipay.com/mini/api/ui-feedback
[my-location]: https://docs.alipay.com/mini/api/location

```
const apiDocPrefix = 'https://docs.alipay.com/miniapp/api/';
let convertJsRule = {
    'showToast': {
        'replacement': 'showToast',
        'tips': 'my.showToast() 参数与 wx.showToast()不一样',
        'link': apiDocPrefix + 'ui-feedback#myshowToast'
    },
    'createBLEConnection': {
        'replacement': 'connectBLEDevice'
    },
    'closeBLEConnection': {
        'replacement': 'disconnectBLEDevice'
    },

    'scanCode': { 'replacement': false },
    'chooseImage': {
        'replacement': false,
        'tips': '参数及返回值有差别，请检查：1. sizeType 参数不被支持，2. 返回值不会带上 tempFiles，即图片的本地文件列表',
        'type': '一般',
        'link': apiDocPrefix + 'media-image#mychooseImage'
    },
    'saveImageToPhotosAlbum': {
        'replacement': 'saveImage',
        'tips': '使用了 wx.js 桥接，参数有差别，请检查：1. showActionSheet 参数是否需要补上',
        'type': '一般',
        'link': apiDocPrefix + 'media-image#mysaveImage'
    },
    'startRecord': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，注意：my.startRecord（）支持更多参数，比如 maxDuration，minDuration， 返回值也有区别',
        'type': '一般',
        'link': apiDocPrefix + 'media-record#mystartRecord'
    },
    'getBackgroundAudioPlayerState': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，返回值对象只有 status 字段可用，其他的 duration，currentPosition，downloadPercent，dataUrl 这些字段没有',
        'type': '一般',
        'link': apiDocPrefix + 'media-audio-play#mygetBackgroundAudioPlayerState'
    },
    'playBackgroundAudio': {
        'replacement': false,
    },
    'chooseVideo': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，请参考文档检查回调函数中的返回值',
        'type': '一般',
        'link': apiDocPrefix + 'media-choosevideo#mychooseVideo'
    },
    'createVideoContext': {
        'replacement': false,
    },
    'uploadFile': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，参数及返回值有差别，请检查',
        'type': '一般',
        'link': apiDocPrefix + 'media-file#myuploadFile'
    },
    'downloadFile': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，参数及返回值有差别，请检查：1. header 字段应为 headers 2. 回调函数中从 res.apFilePath 字段上获取文件临时存放路径',
        'type': '一般',
        'link': apiDocPrefix + 'media-file#mydownloadFile'
    },
    'createMapContext': {
        'replacement': false,
    },
    'getSystemInfo': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，my.getSystemInfo() 返回值与 wx.getSystemInfo() 不一样',
        'link': apiDocPrefix + 'device#mygetSystemInfo'
    },
    'getNetworkType': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，my.getNetworkType() 返回与 wx.getNetworkType() 不一样',
        'link': apiDocPrefix + 'device#mygetNetworkType'
    },
    'onAccelerometerChange': {
        'replacement': false,
    },
    'onCompassChange': {
        'replacement': false,
    },
    'onBluetoothAdapterStateChange': {
        'replacement': false,
    },
    'startBluetoothDevicesDiscovery': {
        'replacement': false,
    },
    'getBluetoothDevices': {
        'replacement': false,
    },
    'getConnectedBluetoothDevices': {
        'replacement': false,
    },
    'onBluetoothDeviceFound': {
        'replacement': false,
    },
    'getBLEDeviceCharacteristics': {
        'replacement': false,
    },
    'readBLECharacteristicValue': {
        'replacement': false,
    },
    'writeBLECharacteristicValue': {
        'replacement': false,
    },
    'notifyBLECharacteristicValueChange': {
        'replacement': false,
    },
    'onBLEConnectionStateChange': {
        'replacement': false,
    },
    'vibrateLong': { 
        'replacement': false 
    },
    'vibrateShort': { 
        'replacement': false 
    },
    'showToast': { 
        'replacement': false 
    },
    'showLoading': { 
        'replacement': false 
    },
    'showActionSheet': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，my.showActionSheet() 参数与 wx.showActionSheet() 不一样',
        'link': apiDocPrefix + 'ui-feedback#myshowActionSheet'
    },
    'setNavigationBarTitle': {
        'replacement': false,
        'tips': '使用了 wx.js 桥接，my.showActionSheet() 参数与 wx.showActionSheet() 不一样',
        'link': apiDocPrefix + 'ui-feedback#myshowActionSheet'
    },
    'canvasToTempFilePath': { 
        'replacement': false 
    },
    'request': {
        'replacement': false 
    },
    'connectSocket': {
        'replacement': false 
    },
    'sendSocketMessage': {
        'replacement': false 
    },
    'setStorageSync': {
        'replacement': false 
    },
    'getStorageSync': {
        'replacement': false
    }
};
```
