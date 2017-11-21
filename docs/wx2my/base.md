## 文件结构

页面结构文件后缀由 **.wxml** 改为 **.axml**, 样式文件由**.wxss** 改为 **.acss**

| [微信小程序][wxStructre]        |    [支付宝小程序][alipayStructre] |
| ------------- |:-------------:|
| **.wxml**  |  **.axml**  |
| **.wxss**  |  **.acss**  |

```文件结构
├── app.wxss
├── app.js
├── app.json
├── pages
		├── home
        ├── home.wxss
        ├── home.wxml
        ├── home.js
        └── home.json
```

```文件结构
├── app.acss
├── app.js
├── app.json
├── pages
		├── home
        ├── home.acss
        ├── home.axml
        ├── home.js
        └── home.json
```

[wxStructre]: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/structure.html
[alipayStructre]: https://docs.alipay.com/mini/framework/overview

## .json

对于json文件两者的一些字段名可能会有所不同。主要有app.json文件和每个页面对应的page.json文件。最常见的字段：页面标题 navigationBarTitleText 替换为 defaultTitle。

| [微信小程序][wxConfig]        |    [支付宝小程序][alipayConfig] | 描述 |
| ------------- |:-------------:|:----:|
| `navigationBarBackgroundColor`  |  `titleBarColor`  | 导航栏背景颜色，#000000 |
| `navigationBarTextStyle`  |  --  | 导航栏标题颜色，仅支持 black/white |
| **`navigationBarTitleText`**  |  **`defaultTitle`**  | 导航栏标题文字内容 |
| `backgroundColor`  |  --  | 窗口的背景色, #ffffff |
| `backgroundTextStyle`  |  --  | 下拉背景字体、loading 图的样式，仅支持 dark/light |
| `enablePullDownRefresh`  |  `pullRefresh`  | 是否开启下拉刷新, true |
| `onReachBottomDistance`  |  --  | 页面上拉触底事件触发时距页面底部距离，单位为px |
| --  |  `allowsBounceVertical`  | 页面是否支持纵向拽拉超出实际内容。默认 YES |


[wxConfig]: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/config.html
[alipayConfig]: https://docs.alipay.com/mini/framework/app#appjson

### app.json

```json
{
	"pages": [ "pages/home/home"],
	"window":{
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "微信接口功能演示",
    "backgroundColor": "#eeeeee",
    "backgroundTextStyle": "light"
  },
	"tabBar": {
	  ...
	  "list": [{
	    "pagePath": "pages/home/home",
	    "iconPath": "imgs/hu-gray.png",
	    "selectedIconPath": "imgs/hu-red.png",
	    "text": "首页"
	  }]
	}
}
```
转换为:
```json
{
	"pages": [ "pages/home/home"],
	"window":{
  	"titleBarColor": "#FFF",
    "defaultTitle": "支付宝接口功能演示",
    "pullRefresh": true,
    "allowsBounceVertical": "YES"
  },
	"tabBar": {
	  ...
	  "items": [{
	    "pagePath": "pages/home/home",
	    "icon": "imgs/hu-gray.png",
	    "activeIcon": "imgs/hu-red.png",
	    "name": "首页"
	  }]
	}
}
```

### page.json
```json
{
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black",
  "navigationBarTitleText": "微信接口功能演示",
  "backgroundColor": "#eeeeee",
  "backgroundTextStyle": "light"
}
```
转换为:
```json
{
	"titleBarColor": "#FFF",
	"defaultTitle": "支付宝接口功能演示",
	"pullRefresh": true,
	"allowsBounceVertical": "YES"
}
```


## xml

| 微信小程序        |    支付宝小程序       |
| ------------- |:-------------|
| `w:`  |  `a:`  |
| `w:for`  |  `a:for`  |
| `bindtap`  |  `onTap`  |
| `bindlongtap`  |  `onLongTap`  |
| `bindtouchstart`  |  `onTouchStart`  |
| `bindtouchmove`  |  `onTouchMove`  |
| `bindtouchcancel`  |  `onTouchCancel`  |
| `bindtouchend`  |  `onTouchEnd`  |
| `catchtap`  |  `catchTap`  |
| `catchlongtap`  |  `catchLongTap`  |
| `catchtouchstart`  |  `catchTouchStart`  |
| `catchtouchmove`  |  `catchTouchMove`  |
| `catchtouchcancel`  |  `catchTouchCancel`  |
| `catchtouchend`  |  `catchTouchEnd`  |
| `catchtouchend`  |  `catchTouchEnd`  |
| `bindSubmit`  |  `onSubmit`  |
| `bindReset`  |  `onReset`  |
| `bindchange`  |  `onChange`  |
| `bindinput`  |  `onInput`  |
| `bindfocus`  |  `onFocus`  |
| `bindblur`  |  `onBlur`  |
| `bindconfirm`  |  `onConfirm`  |
| `placeholder-style`  |  -  |
| `placeholder-class`  |  -  |


## js

| 微信小程序      |  支付宝小程序  	|
| ------------- |:-------------	|
| `wx`  |  `my`  |