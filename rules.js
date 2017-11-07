// 文件转换
*.wxml -> *.axml
*.wxss -> *.acss

// Json字段转换
function convertJson(src, target, done) {
    var pageCfg = fs.readFileSync(src, 'utf8');
    if (pageCfg && pageCfg.length > 0) {
        try {
        var pageCfgObj = JSON.parse(pageCfg);
        if (pageCfgObj) {
            // app.json 里根对象身上有 window 属性，{page_name}.json 里根对象对应着 app.json 中的 window 属性
            var win = 'window' in pageCfgObj ? pageCfgObj.window : pageCfgObj;
            replaceKeyOfObj(win, 'navigationBarTitleText', 'defaultTitle');
            replaceKeyOfObj(win, 'enablePullDownRefresh', 'pullRefresh');
            replaceKeyOfObj(win, 'navigationBarBackgroundColor', 'titleBarColor');

            if ('tabBar' in pageCfgObj) {
                var tabBar = pageCfgObj.tabBar;
                var items = replaceKeyOfObj(tabBar, 'list', 'items');
                if (items) {
                    for (var tabItem in items) {
                        replaceKeyOfObj(items[tabItem], 'iconPath', 'icon');
                        replaceKeyOfObj(items[tabItem], 'selectedIconPath', 'activeIcon');
                        replaceKeyOfObj(items[tabItem], 'text', 'name');
                    }
                }
            }
            pageCfg = JSON.stringify(pageCfgObj, null, '\t');
        }
        } catch (error) {
            console.error(error.message + ' at file ' + src);
        }
    }

    var ws = fs.createWriteStream(target);

    ws.write(pageCfg);
    ws.on('finish', done);
    ws.end();
}

// Wxml转换
function convertWxml(src, target, done) {
    var content = fs.readFileSync(src, 'utf8');
    var ws = fs.createWriteStream(target);
    content = content.replace(/wx:(\w+)/g, "a:$1");
    content = content.replace(/(<include.*)(\.wxml)(.*\/>)/g, "$1.axml$3");
    content = content.replace(/(<import.*)(\.wxml)(.*\/>)/g, "$1.axml$3");
    content = content.replace(/(<!--.*)(\.wxml)(.*-->)/g, "$1.axml$3");
    content = content.replace(/a:key="\s*{{\s*item\s*\.\s*(\w*)\s*}}\s*"/g, "a:key=\"$1\"");
    content = content.replace(/a:for-items=/g, "a:for=");
    content = content.replace(/bindtap/g, "onTap"); 
    content = content.replace(/bindlongtap/g, "onLongTap");
    content = content.replace(/bindtouchstart/g, "onTouchStart");
    content = content.replace(/bindtouchmove/g, "onTouchMove");
    content = content.replace(/bindtouchcancel/g, "onTouchCancel");
    content = content.replace(/bindtouchend/g, "onTouchEnd");

    content = content.replace(/catchtap/g, "catchTap"); 
    content = content.replace(/catchlongtap/g, "catchLongTap");
    content = content.replace(/catchtouchstart/g, "catchTouchStart");
    content = content.replace(/catchtouchmove/g, "catchTouchMove");
    content = content.replace(/catchtouchcancel/g, "catchTouchCancel");
    content = content.replace(/catchtouchend/g, "catchTouchEnd");
    content = content.replace(/catchtouchend/g, "catchTouchEnd");
    content = content.replace(/bindSubmit/g, "onSubmit");
    content = content.replace(/bindReset/g, "onReset");
    content = content.replace(/bindchange/g, "onChange");
    content = content.replace(/bindinput/g, "onInput");
    content = content.replace(/bindfocus/g, "onFocus");
    content = content.replace(/bindblur/g, "onBlur");
    content = content.replace(/bindconfirm/g, "onConfirm");
    content = replaceImport(content, (dep) => {
      if (dep && !dep.startsWith('/') && !dep.startsWith('./') && !dep.startsWith('..')) {
          return './' + dep;
      }
      return dep;
    });
    // content = content.replace(/bindcolumnchange/g, "oncolumnchange"); // 这个目前还未实现
    content = content.replace(/(<icon (\s*[\w-{}]+=[\w-{}"':#]+\s*){0,} type\s*=\s*["']\s*circle\s*["'](\s*[\w-{}]+=[\w-{}"':#]+\s*){0,}><\/icon>)/g, "<!--$1 circle 类型的 icon 不被支持，请用 css 样式来实现-->");
   
    var regex = /(<modal[\s\S]*<\/modal>)/g;
    if (regex.test(content)) {
        content = content.replace(regex, "<!--$1modal 标签已经不被支持，请使用 my.confirm()/my.alert()/my.showToast() 来实现对应功能-->");
        logTips({
            api: 'modal',
            file: target,
            content: 'modal 标签已经不被支持，请使用 my.confirm()/my.alert()/my.showToast() 来实现对应功能',
            'type': '一般',
            link: apiDocPrefix + 'ui-feedback#myconfirm'
        });
    }

    var regex = /<input[\s\S]*placeholder-style/g;
    if (regex.test(content)) {
        logTips({
            api: 'input 组件',
            file: target,
            content: 'input 组件的 placeholder-style 属性不被支持，请使用 css 样式来实现',
            'type': '一般',
            link: 'https://docs.alipay.com/mini/component/input'
        });
    }

    regex = /a:key="\s*{{/g;
    if (regex.test(content)) {
        logTips({
            api: '列表渲染',
            file: target,
            content: '列表渲染 a:key 里不能有变量',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/framework/axml'
        });
    }

    var regex = /bindcolumnchange/g;
    if (regex.test(content)) {
        logTips({
            api: 'picker 组件',
            file: target,
            content: 'picker 组件的 bindcolumnchange 属性不被支持',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<i /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html i 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<p /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html p 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<span /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html span 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<a /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html a 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<b /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html b 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<br /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html br 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<hr /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html hr 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /<font /g;
    if (regex.test(content)) {
        logTips({
            api: '组件',
            file: target,
            content: '不能使用 html font 标签',
            'type': '严重',
            link: 'https://docs.alipay.com/mini/component/view'
        });
    }

    var regex = /(<toast[\s\S]*<\/toast>)/g;
    if (regex.test(content)) {
        content = content.replace(regex, "<!--$1toast 标签已经不被支持，请使用 my.showToast()/my.hideToast() 来实现对应功能-->");
        logTips({
            file: target,
            content: 'toast 标签已经不被支持，请使用 my.showToast() 来实现对应功能',
            'type': '一般',
            link: apiDocPrefix + 'ui-feedback#myshowToast'
        });
    }

    regex = /(<loading[\s|\S]*<\/loading>)/g;
    if (regex.test(content)) {
        content = content.replace(regex, "<!--$1loading 标签已经不被支持，请使用 my.showNavigationBarLoading()/my.hideNavigationBarLoading() 来实现对应功能-->");
        logTips({
            file: target,
            content: 'loading 标签已经不被支持，请使用 my.showToast()/my.hideToast() 来实现对应功能',
            'type': '一般',
            link: apiDocPrefix + 'ui-feedback#myshowNavigationBarLoading'
        });
    }

    var regex = /(<action-sheet[\s|\S]*<\/action-sheet>)/g;
    if (regex.test(content)) {
        content = content.replace(regex, "<!--$1action-sheet 标签已经不被支持，请使用 my.showActionSheet() 来实现对应功能-->");
        logTips({
            file: target,
            content: 'action-sheet 标签已经不被支持，请使用 my.showActionSheet() 来实现对应功能',
            type: '严重',
            link: apiDocPrefix + 'ui-feedback#myshowActionSheet'
        });
    }

    regex = /(<contact-button[\s\S]*<\/contact-button>)/g;
    if (regex.test(content)) {
        content = content.replace(regex, "<!--$1contact-button 标签不被支持，请考虑其他替代方案-->");
        logTips({
            api: 'contact-button',
            file: target,
            content: 'contact-button 标签不被支持，请考虑其他替代方案',
            type: '严重',
            link: apiDocPrefix + 'ui-feedback'
        });
    }

    ws.write(content);
    ws.on('finish', done);
    ws.end();
}

// javascript转换
const apiDocPrefix = 'https://docs.alipay.com/miniapp/api/';
let convertJsRule = {
    'login': {
        'replacement': 'getAuthCode',
        'tips': 'login api 不被支持，请修改 my.getAuthCode() 对应的入参来实现授权功能',
        'type': '严重',
        'link': apiDocPrefix + 'openapi-authorize#mygetAuthCode'
    },
    'saveFile': {
        'tips': 'wx.saveFile 目前不能被支持，请寻找其他替代方案或移除本功能',
        'type': '严重'
    },
    'saveVideoToPhotosAlbum': {
        'tips': 'wx.saveVideoToPhotosAlbum() 目前不支持，请考虑其他方案或移除相应功能',
        'type': '严重'
    },
    'getImageInfo': {
        'tips': 'wx.getImageInfo() 不能被支持，请寻找其他的方案或移除相关功能',
        'type': '严重'
    },
    'getUserInfo': {
        'replacement': 'getAuthUserInfo',
        'tips': '请修改 my.getAuthUserInfo() 对应的入参来实现授权功能',
        'type': '严重',
        'link': apiDocPrefix + 'openapi-authorize#mygetAuthUserInfo'
    },
    'stopPullDownRefresh': { 'replacement': 'allowPullDownRefresh' },
    'showModal': {
        'replacement': 'confirm',
        'tips': '请迁移至 my.alert()/my.confirm() 来完成模态对话框的功能',
        'link': apiDocPrefix + 'ui-feedback#myconfirm'
    },
    'requestPayment': {
        'replacement': 'tradePay',
        'tips': 'wx.requestPayment() 需要迁移至 my.tradePay(), 请参考文档',
        'type': '严重',
        'link': apiDocPrefix + 'openapi-authorize#mytradePay'
    },
    'openDocument': {
        'tips': 'wx.openDocument() 不能被支持，请考虑其他的方案来实现对文档的支持或移除该功能',
        'type': '严重'
    },
    'checkSession': {
        'replacement': 'getAuthCode',
        'tips': 'wx.checkSession() 不需要了，请使用：my.getAuthCode & my.getAuthUserInfo',
        'type': '严重',
        'link': apiDocPrefix + 'openapi-authorize#mygetAuthCode'
    },
    'getLocation': {
        'replacement': 'getLocation',
        'tips': 'my.getLocation() 返回值与 wx.getLocation() 不一样，请注意区分',
        'link': apiDocPrefix + 'location#mygetLocation'
    },
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
    'createContext': {
        'replacement': 'createCanvasContext', 
        'tips': 'my.createCanvasContext() 需要传入 canvas id 作为入参，请适配下',
        'type': '一般', 
        'link': apiDocPrefix + 'ui-canvas#mycreateCanvasContext(canvasId)'
    },
    'drawCanvas': {
        'replacement': 'drawCanvas',
        'tips': 'wx.drawCanvas() 已经废弃，请使用 my.createCanvasContext & canvas.draw 来迁移',
        'type': '严重', 
        'link': apiDocPrefix + 'ui-canvas#draw'
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

// 其他
1. a:key="*this" 中不要使用变量，例如： a:key="index"。
2. my.getSystemInfoSync() 方法需要放在Page onLoad时候执行。