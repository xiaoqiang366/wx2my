// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const appconverter = require('./appconverter');
const opn = require('opn');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const sourcePath = vscode.workspace.rootPath;
    const outputBaseName = path.basename(sourcePath) + '_output';
    const outputPath = path.join(path.dirname(sourcePath), outputBaseName);
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    vscode.window.showInformationMessage('欢迎使用小程序助手');
    
    // const uri = vscode.Uri.parse('file://' + path.join(__dirname, 'README.md'));
    // vscode.commands.executeCommand('markdown.showPreview', uri);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.convertWxApp', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        let possibleWxApp = fs.existsSync(path.join(outputPath, "app.json")) && fs.existsSync(path.join(outputPath, "app.js"));
        let convertFunc = function () {
            // Compile the source code
            // const compiledFunction = pug.compile("p #{name}'s Pug source code!");

            let startInMs = Date.now();
            appconverter.convert(sourcePath, outputPath, function (result) {
                var msg1 = '转换中出现了一些问题';
                const label1 = '查看';
                vscode.window.showInformationMessage(msg1, label1).then((selection) => {
                    if (label1 === selection) {
                        opn(result.logFile);
                    }
                });
                const msg2 = '转换完成，生成的项目位于：' + outputPath;
                console.log('\n\n' + msg2 + '，耗时：' + (Date.now() - startInMs - result.delta) + 'ms' + '\n\n');
                const label2 = '打开'; 
                vscode.window.showInformationMessage(msg2, label2).then((selection) => {
                    if (label2 === selection) {
                         opn(outputPath);
                    }
                });
            },
                function (code, msg) {
                    vscode.window.showErrorMessage('转换失败，code: ' + code + ', msg: ' + msg);
                });
        };
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        fs.createReadStream(path.join(__dirname, 'wx.js')).pipe(fs.createWriteStream(path.join(outputPath, 'wx.js')));        
        if (fs.existsSync(outputPath) && !possibleWxApp) {
            vscode.window.showInputBox({ ignoreFocusOut: false, placeHolder: "y/n", prompt: "请输入 y/n 确认覆盖目录：" + outputBaseName, value: 'n' }
            ).then((userInput) => {
                if (userInput === 'y' || userInput == 'Y') {
                    convertFunc();
                } else {
                    vscode.window.showInformationMessage('请迁移完目录：' + outputBaseName + '下的数据后再回来继续转换！');
                }
            });
        } else {
            convertFunc();
        }
    });

    context.subscriptions.push(disposable);
    return { convert: appconverter.convert };
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
