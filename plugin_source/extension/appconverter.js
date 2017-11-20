'use strict';
// const https = require('https');
const https = require('http');
const fs = require("fs");
const path = require("path");
const endOfLine = require('os').EOL;
const esprima = require('esprima-harmony');
const escodegen = require('escodegen');
const pug = require('pug');
const wm = require('./wm');
var todoTips = [];
var timer = null;
var errorLog = [];
var project = '';

// constants
// api doc link prefix
const apiDocPrefix = 'https://docs.alipay.com/miniapp/api/';
// client version
const clientVersion = '0.0.3';
// id of vs code market deliver channel
const vsCodeMarketChannel = 4602;
// mysql command to find out the most common issues
// select issue, count(*) as total from app_migrate_results group by issue order by total;
function logTips(tip) {
    todoTips.push(tip);
}

const compiledFunction = pug.compileFile(path.join(__dirname, "todo.pug"), { pretty: true });

function httpRequest(api, body, dataCb, errorCb) {
    var options = {
        hostname: '116.62.165.189',
        port: 8080,
        path: '/api/app-migrator/' + api,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', dataCb);
    });
    req.on('error', errorCb);

    req.write(body);
    req.end();
}


function dumpErrorLog(targetFile) {
    for (var i = 0; i < errorLog.length; i++) {
        fs.writeFileSync(targetFile, errorLog[i] + endOfLine);
    }
    var logStr = errorLog.join(endOfLine);
    if (logStr && logStr.length > 0) {
        var body = JSON.stringify({'project': project,
        'version': clientVersion,
        'error': logStr });

        httpRequest('report_migrate_error', body, function (response) {
            console.log('response: ' + response);
        }, function(e) {
            console.error('problem occured when sending error log: ' + e.message);
        });
    }
}

function dumpTips(logFile) {
    // Render a set of data
    function compare(a,b) {
        var result = 0;
        if (a.type === '严重' && b.type === '一般') {
           result = -1;
        } else if (a.type === '一般' && b.type === '严重') {
            result = 1;
        } else {
            result = 0;
        }
        return result;
    }
    todoTips.sort(compare);

    var body = JSON.stringify({'project': project,
        'version': clientVersion,
        'results': todoTips });

    httpRequest('report_migrate_result', body, function (response) {
        console.log('response: ' + response);
    }, function(e) {
        console.error('problem occured when sending usage data: ' + e.message);
    });

    const data = compiledFunction({
        tips: todoTips
    });
    fs.writeFileSync(logFile, data);
}

/**
 * rename the extention name of 'src' to 'extName'
 */
function renameExtname(src, extName) {
    return path.join(path.dirname(src), path.basename(src, path.extname(src)) + extName);
}

function convertJs(src, target, options) {
    var content = fs.readFileSync(src, 'utf8');
    content = content.replace(/require\(\s*'\s*(\w+\.js)\s*'\s*\)/g, "require('./$1')");
    content = content.replace(/(import.*from)\s+'(\w[a-zA-Z0-9\-\.]+)'/g, "$1 './$2'");
    content = content.replace(/iconPath:\s*['"]\s*([^'"]+)\s*['"]/g, function(match, p1) {
        if (!p1.startsWith('/')) { // 如果不是绝对路径，转换成绝对路径
            var iconPath1 = path.normalize(path.join(path.dirname(target), p1));
            var iconPath2 = '/' + path.relative(options.outputBaseDir, iconPath1);
            return 'iconPath: \''  + iconPath2 + '\'';
        }
    });

    var code = null;
    try {
        var ast = esprima.parse(content, { loc: true, comment: true });
        console.log('processing file: ' + src);
        // wx.js 已经被桥接的 api 需要在以下规则中屏蔽改名
        var convertRule = {
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
        refineWxCallExpression(ast, {
            shouldConvert: function (api, ast) {
                if (convertRule && convertRule[api]) {
                    console.log('convert api: ' + api);
                    var tips = convertRule[api].tips;
                    if (tips && tips.length > 0) {
                        logTips({
                            api: api,
                            file: target + (ast.loc && ast.loc.start ? ('(' + ast.loc.start.line + ':' + ast.loc.start.column + ')') : ''),
                            type: convertRule[api].type ? convertRule[api].type : '一般',
                            content: tips,
                            link: convertRule[api].link
                        });
                    }
                    // 在 api 映射表里且有有效 replacement 字段的，需要将 wx -> my；没有 replacement 字段的，不做 wx -> my
                    var replaceApiObj = convertRule[api].replacement && convertRule[api].replacement.length > 0;
                    return replaceApiObj ? { replaceApiObj: true, replacement: convertRule[api].replacement }
                        : { replaceApiObj: false };
                } else {
                    // 不在 api 映射表里，需要将 wx -> my
                    console.log('reserve api: ' + api);
                    return { replaceApiObj: true };
                }               
            }, tip: function (tipObj) {
                tipObj.file = target;
                logTips(tipObj);
            }
        });
        var wmContent = wm.wmEncode(vsCodeMarketChannel);
        ast['leadingComments'] = [
            {
                "type": "Block",
                "value": wmContent,
                "range": [
                    0,
                    wmContent.length
                ]
            }
        ];
        code = escodegen.generate(ast, { comment: true });
    } catch (error) {
        var log = 'error: ' + error.toString() + ', file: ' + src;
        console.log(log);
        errorLog.push(log);
        // ast 解析或代码生成时出现问题则降级通过正则表达式来替换
        code = content.replace(/wx[\s\n\r]*\.[\s\n\r]*(\w+)[\s\n\r]*\(/g, "my.$1(");
    }
    var ws = fs.createWriteStream(target);
    // add requiring of api bridge implement: wx.js
    var relativePath = path.relative(path.dirname(target), options.outputBaseDir);
    var wxPath = ((relativePath == '' ? ('.' + path.sep) : '') + path.join(relativePath, 'wx')).replace(/\\/g, '/');
    var requireStatement = 'const wx = require(\'' + wxPath + '\');';
    ws.write(requireStatement + endOfLine);
    ws.write(code);
    // console.log('decode result: ' + wm.wmDecode(code));
    ws.on('finish', options.done);
    ws.end();
}

function refineWxCallExpression(ast, convertCtx) {
    if (!ast || typeof ast.type !== 'string') {
        return;
    }
    switch (ast.type) {
        case 'Program':
            if (ast.body) {
                for (var i = 0; i < ast.body.length; i++) {
                    refineWxCallExpression(ast.body[i], convertCtx);
                }
            }
            break;
        case 'ExpressionStatement':
            refineWxCallExpression(ast.expression, convertCtx);
            if (ast.expression && ast.expression.arguments && ast.expression.arguments.length > 0) {
                for (var i = 0; i < ast.expression.arguments.length; i++) {
                    refineWxCallExpression(ast.expression.arguments[i], convertCtx);
                }
            }
            break;

        case 'ExportDeclaration':
            ast.type = 'ExportNamedDeclaration';
            refineWxCallExpression(ast.declaration, convertCtx)
            break;

        case 'CallExpression':
            refineWxCallExpression(ast.callee, convertCtx);
            if (ast.arguments) {
                for (var i = 0; i < ast.arguments.length; i++) {
                    refineWxCallExpression(ast.arguments[i], convertCtx);
                }
            }
            break;

        case 'ObjectExpression':
            if (ast.properties) {
                for (var i = 0; i < ast.properties.length; i++) {
                    refineWxCallExpression(ast.properties[i], convertCtx);
                }
            }
            break;

        case 'Property':
            if (ast.key) {
                refineWxCallExpression(ast.key, convertCtx);
            }
            if (ast.value) {
                refineWxCallExpression(ast.value, convertCtx);
            }
            break;

        case 'Identifier':
            if (ast.name === 'onShareAppMessage') {
                convertCtx.tip({
                    'type': '一般',
                    api: '分享接口',                    
                    content: 'Page.onShareAppMessage() 不需要了，请使用：my.share',
                    line: ast.loc.start.line,
                    column: ast.loc.start.column,
                    link: apiDocPrefix + 'ui-share#myshare'
                });
            }

            break;

        case 'FunctionExpression':
            if (ast.params) {
                for (var i = 0; i < ast.params.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }

            if (ast.defaults) {
                for (var i = 0; i < ast.defaults.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }

            if (ast.body) {
                refineWxCallExpression(ast.body, convertCtx);
            }
            break;

        case 'ArrowExpression':
            if (ast.params) {
                for (var i = 0; i < ast.params.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }

            if (ast.defaults) {
                for (var i = 0; i < ast.defaults.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }

            if (ast.body) {
                refineWxCallExpression(ast.body, convertCtx);
            }
            break;

        case 'SequenceExpression':
            if (ast.expressions) {
                for (var i = 0; i < ast.expressions.length; i++) {
                    refineWxCallExpression(ast.expressions[i], convertCtx);
                }
            }
            break;

        case 'BinaryExpression':
            refineWxCallExpression(ast.left, convertCtx);
            refineWxCallExpression(ast.right, convertCtx);
            break;

        case 'AssignmentExpression':
            refineWxCallExpression(ast.right, convertCtx);
            break;

        case 'UpdateExpression':
            refineWxCallExpression(ast.argument, convertCtx);
            break;

        case 'LogicalExpression':
            refineWxCallExpression(ast.left, convertCtx);
            refineWxCallExpression(ast.right, convertCtx);
            break;

        case 'ConditionalExpression':
            refineWxCallExpression(ast.test, convertCtx);
            refineWxCallExpression(ast.alternate, convertCtx);
            refineWxCallExpression(ast.consequent, convertCtx);
            break;

        case 'NewExpression':
            refineWxCallExpression(ast.callee, convertCtx);
            if (ast.arguments) {
                for (var i = 0; i < ast.arguments.length; i++) {
                    refineWxCallExpression(ast.arguments[i], convertCtx);
                }
            }
            break;

        case 'BlockStatement':
            if (ast.body && ast.body.length) {
                for (var i = 0; i < ast.body.length; i++) {
                    refineWxCallExpression(ast.body[i], convertCtx);
                }
            }
            break;

        case 'IfStatement':
            refineWxCallExpression(ast.test, convertCtx);
            refineWxCallExpression(ast.consequent, convertCtx);
            refineWxCallExpression(ast.alternate, convertCtx);
            break

        case 'LabeledStatement':
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'WithStatement':
            refineWxCallExpression(ast.object, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'SwitchCase':
            refineWxCallExpression(ast.test, convertCtx);
            if (ast.consequent) {
                for (var i = 0; i < ast.consequent.length; i++) {
                    refineWxCallExpression(ast.consequent[i], convertCtx);
                }
            }
            break;

        case 'SwitchStatement':
            refineWxCallExpression(ast.discriminant, convertCtx);
            if (ast.cases) {
                for (var i = 0; i < ast.cases.length; i++) {
                    refineWxCallExpression(ast.cases[i], convertCtx);
                }
            }
            break;

        case 'ReturnStatement':
            refineWxCallExpression(ast.argument, convertCtx);
            break;

        case 'WhileStatement':
            refineWxCallExpression(ast.test, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'DoWhileStatement':
            refineWxCallExpression(ast.test, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'ForStatement':
            refineWxCallExpression(ast.init, convertCtx);
            refineWxCallExpression(ast.test, convertCtx);
            refineWxCallExpression(ast.update, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'ForInStatement':
            refineWxCallExpression(ast.left, convertCtx);
            refineWxCallExpression(ast.right, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'ForOfStatement':
            refineWxCallExpression(ast.left, convertCtx);
            refineWxCallExpression(ast.right, convertCtx);
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'LetStatement':
            if (ast.head) {
                for (var i = 0; i < ast.head.length; i++) {
                    refineWxCallExpression(ast.head[i], convertCtx);
                }
            }
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'ArrayExpression':
            if (ast.elements) {
                for (var i = 0; i < ast.elements.length; i++) {
                    refineWxCallExpression(ast.elements[i], convertCtx);
                }
            }
            break;

        case 'MemberExpression':
            if (ast.object && ast.object.type === 'Identifier') {
                if (ast.object.name === 'wx') {
                    if (ast.property && ast.property.type === 'Identifier') {
                        var apiName = ast.property.name;
                        var result = convertCtx.shouldConvert(apiName, ast);
                        if (result.replacement) {
                            ast.property.name = result.replacement;
                        }
                        if (result.replaceApiObj) {
                            ast.object.name = 'my';
                        }
                    }
                }
            }
            break;

        case 'UnaryExpression':
            refineWxCallExpression(ast.argument, convertCtx);
            break;

        case 'ArrowFunctionExpression':
            if (ast.params) {
                for (var i = 0; i < ast.params.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }
            refineWxCallExpression(ast.body, convertCtx);
            break;

        case 'VariableDeclarator':
            if (ast.init) {
                refineWxCallExpression(ast.init, convertCtx);
            }
            break;

        case 'VariableDeclaration':
            if (ast.declarations) {
                for (var i = 0; i < ast.declarations.length; i++) {
                    refineWxCallExpression(ast.declarations[i], convertCtx);
                }
            }
            break;

        case 'AssignmentPattern':
            refineWxCallExpression(ast.left, convertCtx);
            refineWxCallExpression(ast.right, convertCtx);
            break;

        case 'FunctionDeclaration':
            if (ast.params) {
                for (var i = 0; i < ast.params.length; i++) {
                    refineWxCallExpression(ast.params[i], convertCtx);
                }
            }

            if (ast.defaults) {
                for (var i = 0; i < ast.defaults.length; i++) {
                    refineWxCallExpression(ast.defaults[i], convertCtx);
                }
            }

            if (ast.body) {
                refineWxCallExpression(ast.body, convertCtx)
            }
            break;
    }
}
/**
 * <import src="item.axml"/>
 */
const AXML_IMPORT_RE = /(\bimport\s+(?:src\s*=\s*)??)(['"])([^'"]+)(\2)/g;

/**
 * @import 'custom.css'
  @import url("bluish.css")
 */
const ACSS_IMPORT_RE = /(import\s*?)(['"])([^'"]+)(\2\s*?)/g; // ??? 为啥 @ 不能放在正则表达式里
const ACSS_IMPORT_RE_2 = /(import\s*?url\(\s*?)(['"])([^'"]+)(\2\s*?\))/g;
const JS_IMPORT_RE = /(\bimport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
const JS_EXPORT_RE = /(\bexport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
const JS_REQUIRE_RE = /(\brequire\s*?\(\s*?)(['"])([^'"]+)(\2\s*?\))/g;

/**
 * replace the file path inside import/require/include/@import
 * 
 * @param {*} content 
 * @param {*} replacer 
 */
function replaceImport(content, replacer) {
    function _replacer(_match, pre, quot, dep, post) {
        return `${pre}${quot}${replacer(dep)}${post}`;
    }

    return content
            .replace(ACSS_IMPORT_RE_2, _replacer)
            .replace(AXML_IMPORT_RE, _replacer)
            .replace(ACSS_IMPORT_RE, _replacer)
            .replace(JS_IMPORT_RE, _replacer)
            .replace(JS_EXPORT_RE, _replacer)
            .replace(JS_REQUIRE_RE, _replacer)
        ;
}

function convertWxss(src, target, done) {
    var content = fs.readFileSync(src, 'utf8');
    var ws = fs.createWriteStream(target);
    content = content.replace(/(@import.*)(\.wxss)(.*;)/g, "$1.acss$3");
    ws.write(content);
    ws.on('finish', done);
    ws.end();
}

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

// function convertColor(prop, newProp, content) {
//     var regex = new RegExp('(' + prop + '.*)#([a-zA-Z]+)', 'g');
//     var match = null;
//     while ((match = regex.exec(content)) !== null) {
//         if (match[2]) {
//             var hexColor = match[2];
//             var decimalColor = parseInt(hexColor, 16);
//             content = content.replace(regex, "$1" + decimalColor);
//             if (prop !== newProp) {
//                 content = content.replace(new RegExp(prop, 'g'), newProp); // 标题栏背景色
//             }
//         }
//     }
//     return content;
// }

function replaceKeyOfObj(target, originKey, newKey) {
    if (originKey in target) {
        var old = target[originKey];
        delete target[originKey];
        target[newKey] = old;
        return old;
    }
    return undefined;
}

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

function duplicateFile(src, target) {
    fs.createReadStream(src).pipe(fs.createWriteStream(target));
}

function duplicateDirectory(src, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }
}
/**
 * 
 * @param {*} srcPath 
 * @param {*} targetPath 
 * @param {*} options 
 */
function iterateFile(srcPath, targetPath, options) {
    fs.readdir(srcPath, function (err, files) {
        if (err) {
            if (options && options.failed) {
                options.failed(-1, "Could not list the directory.");
            }
            process.exit(1);
        } else {
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath);
            }
            files.forEach(function (file, index) {
                var srcFilePath = path.join(srcPath, file);
                var targetFilePath = path.join(targetPath, file);
                fs.stat(srcFilePath, function (err, stat) {
                    if (stat.isFile()) {
                        var extName = path.extname(file);
                        if (extName === '.wxss') {
                            targetFilePath = renameExtname(targetFilePath, ".acss");
                            convertWxss(srcFilePath, targetFilePath, options.done);
                        } else if (extName === '.wxml') {
                            targetFilePath = renameExtname(targetFilePath, ".axml");
                            convertWxml(srcFilePath, targetFilePath, options.done);
                        } else if (extName === '.js') {
                            convertJs(srcFilePath, targetFilePath, options);
                        } else if (extName === '.json') {
                            convertJson(srcFilePath, targetFilePath, options.done);
                        } else {
                            duplicateFile(srcFilePath, targetFilePath);
                        }
                    } else if (stat.isDirectory() && !path.basename(srcFilePath).startsWith('.')) {
                        if (file.toLowerCase() == 'wxparse') {
                            logTips({
                                api: '富文本',
                                file: targetFilePath,
                                content: 'wxParse 不能被直接支持，请使用 my 版本的 wxParse:(TODO: url) ...',
                                'type': '严重',
                                link: 'https://docs.alipay.com/mini/component/view'
                            });
                        }
                        duplicateDirectory(srcFilePath, targetFilePath);
                        iterateFile(srcFilePath, targetFilePath, options);
                    }
                });
            });
        }
    });
}

function doneWrapper(res) {
    dumpTips(res.logFile);
    dumpErrorLog(res.errorFile);
    if (res.done) {
        res.done({
            'delta': res.delta,
            'logFile': res.logFile
        });
    }
}

/**
 * convert the wx-app project located at 'srcPath' to a xx-app project and store it at 'targetPath',
 * sucess callback to be invoked when the convert process successes
 * failed callback to be invoked when the convert process encounters error
 */
function convert(srcPath, targetPath, success, failed) {
    project = path.basename(srcPath);
    iterateFile(srcPath, targetPath, {
        outputBaseDir: targetPath,
        failed: failed,
        done: function () {
            if (timer != null) {
                clearTimeout(timer);
            }
            const TIME_OUT = 1000;
            timer = setTimeout(doneWrapper, TIME_OUT, {
                done: success,
                logFile: path.join(targetPath, 'todo.html'),
                errorFile: path.join(targetPath, 'error.txt'),
                delta: TIME_OUT,
                targetPath: targetPath
            });
        }
    });
}
exports.convert = convert;
