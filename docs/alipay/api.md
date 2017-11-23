## 界面
#### [导航栏](https://docs.alipay.com/mini/api/ui-navigate)
+ my.navigateTo
+ my.redirectTo
+ my.navigateBack
+ my.reLaunch
+ my.setNavigationBar
+ my.showNavigationBarLoading
+ my.hideNavigationBarLoading

#### [TabBar](https://docs.alipay.com/mini/api/ui-tabbar)
+ my.switchTab

#### [交互反馈](https://docs.alipay.com/mini/api/ui-feedback)
+ my.alert
+ my.confirm
+ my.showToast
+ my.hideToast
+ my.showLoading
+ my.hideLoading
+ my.showNavigationBarLoading
+ my.hideNavigationBarLoading
+ my.showActionSheet

#### [下拉刷新](https://docs.alipay.com/mini/api/ui-pulldown)
+ onpulldownrefresh
+ my.stoppulldownrefresh

#### [联系人](https://docs.alipay.com/mini/api/ui-contact)
+ my.choosephonecontact
+ my.choosealipaycontact

#### [选择城市](https://docs.alipay.com/mini/api/ui-city)
+ my.choosecity

#### [选择日期](https://docs.alipay.com/mini/api/ui-date)
+ my.datepickerobject

#### [动画](https://docs.alipay.com/mini/api/ui-animation)
+ my.createanimation

#### [画布](https://docs.alipay.com/mini/api/ui-canvas)
+ my.createcanvascontextcanvasid
+ totempfilepath
+ settextalign
+ settextbaseline
+ setfillstyle
+ createlineargradient
+ createcirculargradient
+ addcolorstop
+ setlinewidth
+ setlinecap
+ setlinejoin
+ setmiterlimit
+ rect
+ fillrect
+ strokerect
+ clearrect
+ fill
+ stroke
+ beginpath
+ closepath
+ moveto
+ lineto
+ arc
+ beziercurveto
+ clip
+ quadraticcurveto
+ scale
+ rotate
+ translate
+ setfontsize
+ filltext
+ drawimage
+ setglobalalpha
+ save
+ restore
+ draw

#### [地图](https://docs.alipay.com/mini/api/ui-map)
+ my.createmapcontextmapid

#### [键盘](https://docs.alipay.com/mini/api/ui-hidekeyboard)
+ my.hidekeyboard

#### [滚动](https://docs.alipay.com/mini/api/scroll)
+ my.pagescrollto

#### [节点查询](https://docs.alipay.com/mini/api/selector-query)
+ my.createselectorquery
+ selectorquery

## 开放接口
#### [用户授权](https://docs.alipay.com/mini/api/openapi-authorize)
+ my.getauthcode

#### [客户端获取会员信息](https://docs.alipay.com/mini/api/userinfo)
+ my.getauthuserinfo

#### [小程序唤起支付](https://docs.alipay.com/mini/api/openapi-pay)
+ my.tradepay

#### [小程序二维码](https://docs.alipay.com/mini/api/openapi-qrcode)
+ alipayopenappqrcodecreate

#### [跳转支付宝卡包](https://docs.alipay.com/mini/api/card-voucher-ticket)
+ my.opencardlist
+ my.openmerchantcardlist
+ my.opencarddetail
+ my.openvoucherlist
+ my.openmerchantvoucherlist
+ my.openvoucherdetail
+ my.openkbvoucherdetail
+ my.openticketlist
+ my.openmerchantticketlist
+ my.openticketdetail

#### [芝麻认证](https://docs.alipay.com/mini/api/zm-service)
+ my.startzmverify

## 多媒体
#### [图片](https://docs.alipay.com/mini/api/media-image)
+ my.chooseImage
+ my.previewImage
+ my.saveImage

## 缓存
#### [缓存](https://docs.alipay.com/mini/api/storage)
+ my.setStorage
+ my.setStorageSync
+ my.getStorage
+ my.getStorageSync
+ my.removeStorage
+ my.removeStorageSync
+ my.clearStorage
+ my.clearStorageSync
+ my.getStorageInfo
+ my.getStorageInfoSync

#### [位置](https://docs.alipay.com/mini/api/location)
+ my.getLocation(OBJECT)
+ my.openLocation

## 网络
#### [网络](https://docs.alipay.com/mini/api/network)
+ my.httpRequest
+ my.uploadFile
+ my.downloadFile
+ my.connectSocket
+ my.onSocketOpen
+ my.onSocketError
+ my.sendSocketMessage
+ my.onSocketMessage
+ my.closeSocket
+ my.onSocketClose

## 设备
#### [获取基础库版本号](https://docs.alipay.com/mini/api/sdk-version)
+ my.SDKVersion

#### [canIUse](https://docs.alipay.com/mini/api/can-i-use)
+ my.canIUse(String)

#### [系统信息](https://docs.alipay.com/mini/api/system-info)
+ my.getSystemInfo
+ my.getSystemInfoSync

#### [网络状态](https://docs.alipay.com/mini/api/network-status)
+ my.getNetworkType

#### [剪贴板](https://docs.alipay.com/mini/api/clipboard)
+ my.getClipboard
+ my.setClipboard

#### [摇一摇](https://docs.alipay.com/mini/api/shake)
+ my.watchShake(OBJECT)

#### [震动](https://docs.alipay.com/mini/api/vibrate)
+ my.vibrate(OBJECT)

#### [拨打电话](https://docs.alipay.com/mini/api/macke-call)
+ my.makePhoneCall(OBJECT)

#### [获取服务器时间](https://docs.alipay.com/mini/api/get-server-time)
+ my.getServerTime(OBEJCT)

#### [用户截屏事件](https://docs.alipay.com/mini/api/user-capture-screen)
+ my.onUserCaptureScreen(CALLBACK)
+ my.offUserCaptureScreen()

## 蓝牙
#### [蓝牙接入API列表](https://docs.alipay.com/mini/api/bluetooth-api)
+ my.openBluetoothAdapter
+ my.closeBluetoothAdapter
+ my.getBluetoothAdapterState
+ my.startBluetoothDevicesDiscovery
+ my.stopBluetoothDevicesDiscovery
+ my.getBluetoothDevices
+ my.getConnectedBluetoothDevices
+ my.connectBLEDevice
+ my.disconnectBLEDevice
+ my.writeBLECharacteristicValue
+ my.readBLECharacteristicValue
+ my.notifyBLECharacteristicValueChange
+ my.getBLEDeviceServices
+ my.getBLEDeviceCharacteristics
+ my.onBluetoothDeviceFound
+ my.offBluetoothDeviceFound
+ my.onBLECharacteristicValueChange
+ my.offBLECharacteristicValueChange
+ my.onBLEConnectionStateChanged
+ my.offBLEConnectionStateChanged
+ my.onBluetoothAdapterStateChange
+ my.offBluetoothAdapterStateChange

## 数据安全
#### [数据安全](https://docs.alipay.com/mini/api/data-safe)
+ my.rsa

## 分享
#### [分享](https://docs.alipay.com/mini/api/share_app)
+ onShareAppMessage

## 自定义分析
#### [自定义分析](https://docs.alipay.com/mini/api/report)
+ my.reportAnalytics
