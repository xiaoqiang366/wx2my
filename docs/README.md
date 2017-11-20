# wx2my
微信小程序转化支付宝小程序部分规则

### 其他
1. 所有评价模块都不需要移植，带评论的样式也移除
2. Page 函数不能被替换 
解决方案：使用 my.myPage replace Page

3. my.getSystemInfoSync同步方法 在项目初始化时调用报错
解决方案: 要在页面加载完才能调用 :app.onLauch。或者用异步api调用 

4. scroll-view 组件使用hidden失效
解决方案：在外层包一层view控制

5. scroll-view css height:100% 会被内容撑开
解决方案：获取windowHeight 设置高度
 <view animation="{{transform}}"> 

6. transform初始值为{}导致报错
解决方案：tranform=null 

7. 对于在axml中使用需要使用到的数据需要在 data初始化否则可能会报错
很多es6的对象,数组方法不支持.需要自行引入pollyfill

8. getCurrentPages 方法返回的路由的当前页面key是 route 而不是 __route__
[page||app].json 设置标题的key为defaultTitle

9. 网络请求方法为 my.httpRequest ，返回状态码字段为 status，请求头字段为 headers

10. my.getStorageSync({ key: 'key' }) 获取的缓存是一个对象 obj，通过 obj.data 获取到数据
input等标签默认样式和微信默认样式不一样，需要重置 

11. 页面对应 .json 文件中定定义的标题字段由 navigationBarTitleText 改为 defaultTitle ; 标题设置方法 wx.setNavigationBarTitle(Object) 改为 my.setNavigationBar(Object)
wx.showModal => my.confirm,
12. my.fetch中的data参数，内部有对象的，需要先通过JSON.stringify进行转换，原因是支付宝在传递参数时，会将其转换为[object Object]而不是JSON字符串

13. chepin/detail有问题，app.json中路径放到其上面

14. 动画效果在scroll-view上会失效，提出来包裹一层将动画效果放在外层就好了

15. 真机查看时IOS端闪退问题，可能是由于请求头设置的VersionCode设置为了数字，修改为字符串即可，header = { VersionCode: 66 } => header = { VersionCode: '66' }

16. scroll-view 组件若要使用 scroll-into-view 功能 需要删除scroll-with-animation

17. 注意my.getSystemInfoSync在真机和模拟器获取的返回数据不一致，不同页面获取的windowHeight 不一致！

18. 图片上传 my.uploadFile 参数中需要添加 headers 头信息

19. 回到顶部设置 scrollTop 为0可尝试设置为1. 

20. 在线客服目前都统一为拨打电话，my.Util.toCall() 

21. 动画效果在scroll-view上会失效，提出来包裹一层将动画效果放在外层就好了

22. a:key="*this" 中不要使用变量，例如： a:key="index"。
22. 缓存数据(my.setStorage/my.setStorageSync/my.getStorage/my.getStorageSync)获取/存储入参数需要添加**key**字段，[参考地址](https://docs.alipay.com/mini/api/storage)。
实例代码： 
```
let res = my.getStorageSync({ 
    key: currentCity 
});
```

24. **my.getSystemInfoSync** 同步获取设备信息方法需要放在page生命周期中的方法中执行才能正常执行，如需提前获取可通过**my.getSystemInfo**方法。
25. 支付宝小程序不支持 Array.prototype.fill()、Array.prototype.find()、Symbol对象
26. [**scroll-view**](https://docs.alipay.com/mini/component/scroll-view) 高度设置100%无效，需要js动态设置 [height](https://docs.alipay.com/mini/api/device#mygetsysteminfo)值。


### 文件转换
```
*.wxml -> *.axml
*.wxss -> *.acss
```

### Json字段转换
* **navigationBarTitleText** -> **defaultTitle**
* enablePullDownRefresh -> pullRefresh
* navigationBarBackgroundColor -> titleBarColor
```
"tabBar": {
  ...
  "list": [{
    "pagePath": "pages/home/home",
    "iconPath": "imgs/hu-gray.png",
    "selectedIconPath": "imgs/hu-red.png",
    "text": "首页"
  }]
}
```
转换为

```
"tabBar": {
  ...
  "items": [{
    "pagePath": "pages/home/home",
    "icon": "imgs/hu-gray.png",
    "activeIcon": "imgs/hu-red.png",
    "name": "首页"
  }]
}
```

### Wxml转换
* 引用替换
    * `.wxml` -> `.axml`
* 属性替换
    * **`w:`** --> **`a:`**
    * **`a:for-items=`** --> **`a:for=`**
    * **`bindtap`** --> **`onTap`**
    * **`bindlongtap`** --> **`onLongTap`**
    * **`bindtouchstart`** --> **`onTouchStart`**
    * **`bindtouchmove`** --> **`onTouchMove`**
    * **`bindtouchcancel`** --> **`onTouchCancel`**
    * **`bindtouchend`** --> **`onTouchEnd`**
    * **`catchtap`** --> **`catchTap`**
    * **`catchlongtap`** --> **`catchLongTap`**
    * **`catchtouchstart`** --> **`catchTouchStart`**
    * **`catchtouchmove`** --> **`catchTouchMove`**
    * **`catchtouchcancel`** --> **`catchTouchCancel`**
    * **`catchtouchend`** --> **`catchTouchEnd`**
    * **`catchtouchend`** --> **`catchTouchEnd`**
    * **`bindSubmit`** --> **`onSubmit`**
    * **`bindReset`** --> **`onReset`**
    * **`bindchange`** --> **`onChange`**
    * **`bindinput`** --> **`onInput`**
    * **`bindfocus`** --> **`onFocus`**
    * **`bindblur`** --> **`onBlur`**
    * **`bindconfirm`** --> **`onConfirm`**
    * **`placeholder-style`** --> not support
    * **`placeholder-class`** --> not support
    * **`a:key`** --> 值不能绑定变量
* 控件替换
    * 不能使用普通为被支持的html标签例如： `i`、`p` `span` `a` `b` `br` `hr` `font`

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
