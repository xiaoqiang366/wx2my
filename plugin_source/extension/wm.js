/**
 * watermark util
 */
var dateFormat = require('dateformat');
var endOfLine = require('os').EOL;
var prefix = ' converted by appconverter';

exports.wmEncode = function(num) {
    if (typeof num === 'number') {
        var kernel = (num + '').split('').map(function(n) {
            var result = '';
            for (var i = +n; i > 0; i--) {
                result += ' ';
            }
            return result;
        }).join('\t');
        var now = new Date();
        return prefix + kernel + endOfLine + '   on ' + dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT") + endOfLine;
    }
    return '';
}

exports.wmDecode = function(str) {
    if (typeof str === 'string') {
        if (str.startsWith('/*' + prefix)) {
            var start = prefix.length;
            var end = str.indexOf(endOfLine, start);
            if (start < end) {
                var encoded = str.substring(start, end);
                if (encoded && encoded.length > 0) {
                    var encodedArray = encoded.split('');
                    var magicArray = [0, 0, 0, 0];
                    var magicIndex = 0;
                    for (var i = 0; i < encodedArray.length; i++) {
                        if (encodedArray[i] === ' ') {
                            magicArray[magicIndex]++;
                        } else if (encodedArray[i] === '\t') {
                            magicIndex++;
                            if (magicIndex > magicArray.length) {
                                break;
                            }
                        }
                    }
                    return +(magicArray.join(''));
                }
            }

        }
    }
    return NaN;
}
