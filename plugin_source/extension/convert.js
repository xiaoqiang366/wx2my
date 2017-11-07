#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var appconverter = require('./appconverter');

function help() {
    console.log('');
    console.log('用法: ' + process.argv[1] + ' [源小程序工程目录] ');
    console.log('注： 新生成的小程序工程目录为 [源小程序工程目录]_output');
    console.log('');
}

if (process.argv.length == 3) {
    if (process.argv[2] !== 'help') {
        var sourcePath = process.argv[2];
        var outputPath = path.join(path.dirname(sourcePath), path.basename(sourcePath) + '_output');
        if (fs.existsSync(outputPath)) {
            console.error('强制覆盖输出目录：' + outputPath);
        }
        var startInMs = Date.now();
        appconverter.convert(sourcePath, outputPath, function (result) {
            var msg2 = '转换中出现了若干问题，见文档：' + result.logFile;
            var msg = '转换完成，输出目录：' + outputPath + '，耗时：' + (Date.now() - startInMs - result.delta) + 'ms';
            console.error(msg);
            console.error(msg2);
        }, function (code, msg) {
            console.error('转换失败，code: ' + code + ', msg: ' + msg);
        });
        console.log('新生成的小程序工程目录为：' + outputPath);
    } else {
        help();
    }
} else {
    help();
}
