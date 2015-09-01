#<center>**弹幕**<center>
-----

> 该插件第一个版本实现了基本的弹幕墙效果，没有做过多的样式设计，原因是不同场景中的样式皮肤风格都不确定，所以皮肤需要使用者自己定义。

###**1.弹幕对象创建**

    var dm = $('.danMu').danMu({
      	// lineCount: 5,
      	// lineHeight: 200,
      	minTime: 5000,
      	maxTime: 15000,
      	getMsgHtml: function(msgData){
      		var arr = [];
      		arr.push('<div class="msg"><img src="');
      		arr.push(msgData.img);
      		arr.push('">');
      		arr.push(msgData.text);
      		arr.push('</div>');
      		return arr.join('');
      	},
	}).init();
参数说明：

>  - **getMsgHtml** (类型：Function) 	 组装单条消息的回调方法，参数为单条数据对象。
> 	 
>  - **lineCount** (类型：Number) 	 行数，和lineHeight二选一，都不配置会自动计算能放的最大行数，都配置lineHeight失效。
> 	 
>  - **lineHeight**:200  (类型：Number) 	自定义每行所占的高度，用于计算行数，如果lineCount有配置就无效。
> 	
>  - **minTime**:5000  (类型：Number) 	滚动到头需要的最少时间（单位： 毫秒）。
> 	
>  - **maxTime**:15000  (类型：Number) 	滚动到头需要的最多时间（单位： 毫秒）。
> 	
>  - **返回值**  (类型：Object) 	 返回弹幕对象，包含两个方法分别是：
> 	  - init()    初始化弹幕墙
> 	  - push(itemObj,startFn,finishFn)  startFn 为开始播放回调,finishFn 为结束播放后的回调

###**2.消息新增**

    setInterval(function(){
    	var i = Math.round(Math.random() * 9) + 1;
    	var item = {
    		img: './images/' + i + '.gif',
    		text: '哈哈' + i
    	};
    	dm.push(item,function(obj){
		//console.log('开始播放:',obj);
	},function(obj){
		//console.log('播放结束:',obj);
	});
    },700);

新增消息说明

> **dm.push(item, function(obj){},function(obj){})**
> 
>  - 第一个参数为每条消息的自定义对象，该对象默认插件会读取text作为消息内容进行显示，如果弹幕对象的**getMsgHtml**方法被抽重写那么就会作为调用该方法的一个参数传递进去进行消息html拼装。
>  
>  - 第二个参数为该条消息开始播放开始时的通知回掉，可选填（如果第三个参数要传此项就为必填项），参数为消息对象。
>  - 第三个参数为该条消息开始播放结束时的通知回掉，可选填，参数为消息对象。


