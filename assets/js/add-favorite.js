/**
 * - chrome为了安全考虑，设计的不支持js操作加入收藏夹，
 * - 火狐23之后开始废止window.sidebar因为不是w3c标注 https://bugzilla.mozilla.org/show_bug.cgi?id=691647
 * - document.all 判断IE不够靠谱，因为现在许多浏览器也实现了document.all吗，并且IE11以后(document.all)为falsy
 * - 参考 http://stackoverflow.com/questions/10033215/add-to-favorites-button
 * - IE 中typeof window.external.addFavorite 为'unknown' [http://www.xdarui.com/archives/203.html];
 */
var url = window.location.href,
  title = window.document.title;

document.getElementById('bookmarkme').onclick = function(e) {
  addFavorite(url, title);
  e.preventDefault();
};

function addFavorite(url, title) {
  if (window.external && 'addFavorite' in window.external) { // IE
    window.external.addFavorite(url, title);
  } else if (window.sidebar && window.sidebar.addPanel) { // Firefox23后被弃用
    window.sidebar.addPanel(url, title);
  } else if (window.opera && window.print) { // rel=sidebar，读取a链接的href，title 注：opera也转战webkit内核了
    this.title = title;
    return true;
  } else { // webkit - safari/chrome
    alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
  }
}