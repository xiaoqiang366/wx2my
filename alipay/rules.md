#### 实际提审问题

<span style="font-size: 12px;">更新时间: 2017-11-21</span>

[支付宝小程序官方审核规范](https://docs.alipay.com/mini/operation/check)，除了官方规定的一些审核标准之外在时间提审过程中也遇到很多限制，具体参考下面列列举的几点，每次版本发布测试之前需要注意确认。


1. **不能出现带有"评价"相关的信息和功能。**驳回原因：涉及违规字段: 出现互动性词汇
2. **"首页"车型选择不要出现"行驶里程"。**原因: 用户在首页不能输入里程, 可能会别判定为功能Bug.
3. **不能出现视频播放。**
4. **所有提示不能涉及引导APP下载等, 不支持跳转的提示统一改为“暂不支持，敬请期待”。**
```javascript
my.alert({ 
	title: '温馨提示',
	content: '暂不支持，敬请期待'
});
```
5. **不能出现一些功能Bug.**
