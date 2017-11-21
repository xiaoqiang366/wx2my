## my.getSystemInfoSync
> [my.getSystemInfoSync][mygetsysteminfosync]同步方法 在项目初始化时调用报错。

1. 在页面生命周期函数（onLaunch、onShow、onHide、onError）中调用此方法。
2. 使用异步方法[my.getSystemInfo][mygetSystemInfo]获取所需信息。

!> 注意：在模拟器中获取的数据参数和真机上获取参数不同，可能会导致模拟器中`system` `platform`等参数获取不到; `my.getStorageSync({ key: 'key' })` 获取的数据是一个对象 obj，通过 obj.data 获取到数据， 此处和微信小程序有所不同



## scroll-view
> 组件使用hidden失效

在外层包一层view控制

> 组件css height:100% 会被内容撑开

通过[my.getSystemInfoSync][mygetsysteminfosync]或[my.getSystemInfo][mygetSystemInfo]获取windowHeight设置高度.

!> 设置高度、宽度过程如果有需要rpx转px计算可调用`my.Util.rpx2px(num)`方法


> 使用 scroll-into-view 滚动异常

尝试删除`scroll-with-animation`属性

> 回到顶部设置 scrollTop 为0无效.

尝试将 scrollTop 设置为1
```
bindGotop() { //回至顶部
  this.setData({
    scrollTop: this.data.scrollTop ? 0 : 1
  });
}
```

[mygetsysteminfosync]: https://docs.alipay.com/mini/api/system-info#mygetsysteminfosync
[mygetSystemInfo]: https://docs.alipay.com/mini/api/system-info#mygetsysteminfo


## 网络请求

> 网络请求方法 `my.httpRequest` ，返回状态码字段为 status，请求头字段为 headers

调用时需注意

> `my.fetch`中的data参数，内部有对象的，需要先通过`JSON.stringify`进行转换，原因是支付宝在传递参数时，会将其转换为`[object Object]`而不是JSON字符串

调用时需注意

> 真机查看时IOS端闪退问题

可能是由于请求头设置的VersionCode设置为了数字，修改为字符串即可，header = { VersionCode: 66 } => header = { VersionCode: '66' }




## 方法调用

> `getCurrentPages` 方法返回的路由的当前页面key是 route 而不是 route [page||app].json

调用时需注意

> 图片上传 `my.uploadFile` 参数中需要添加 headers 头信息

同时需要注意用户选择图片时返回值与微信不同,[微信参考][wxUplaodImage] [支付宝参考][alipayUplaodImage]

[wxUplaodImage]: https://mp.weixin.qq.com/debug/wxadoc/dev/api/media-picture.html#wxchooseimageobject
[alipayUplaodImage]: https://docs.alipay.com/mini/api/media-image#mychooseimage



## 样式类

> input等标签默认样式和微信默认样式不一样

需要重置


> 动画效果在scroll-view上会失效

提出来包裹一层将动画效果放在外层




## 其他

> transform初始值为{}导致报错

tranform=null


> 对于在axml中使用需要使用到的数据需要在 data初始化否则可能会报错 很多es6的对象(例如Array.prototype.fill()、Array.prototype.find()、Symbol等)不支持

及时提出，统一引入相关pollyfill处理