/*
 * Author: Anser
 * License: MIT license
 */
;(function($){
	'use strict';
	
	var dmWidth = 0,dmHeight = 0;

	function DanMuMsg(setting){
		this.conf = jQuery.extend({
			msgData: {},
			getMsgHtml: null,
			danMuJquery: $('.danMu'),
			lineNum: 1,// 行号
			time: 5000,// 几秒中运动完成
		}, setting || {});
		
		this.lineObj = this.conf.danMuJquery.find('div[data-i="' + this.conf.lineNum + '"]');
		this.msgObj = null;
		this.msgWidth = 0;// 用于存储消息的宽度

		this.speed = 7;// 每毫秒移动的位移
	}
	DanMuMsg.prototype = {
		getHtml: function(){
			// 获取单条消息的html
			if(this.conf.getMsgHtml){
				return $(this.conf.getMsgHtml(this.conf.msgData));
			}
			var arr = [];
			arr.push('<div class="msg">');
			arr.push(this.conf.msgData.text);
			arr.push('</div>');
			return $(arr.join(''));
		},
		appendToHtml: function(){
			var msg = this.getHtml();
			this.msgObj = msg;
			msg.css('transform', 'matrix(1, 0, 0, 1,' + dmWidth + ', 0)');
			this.lineObj.append(msg);
			this.msgWidth = msg.outerWidth(true);

			this.speed = (dmWidth + this.msgWidth) / this.conf.time;
		},
		init: function(){
			// 消息初始化
			this.appendToHtml();
			return this;
		},
		play: function(){
			var _this = this;
			var time = this.conf.time;
			var transition = 'transform ' + (time / 1000).toFixed(2) + 's linear';
			_this.msgObj.css({
				'transition': transition,
				'-moz-transition': transition,
				'-webkit-transition': transition,
				'-o-transition': transition,
			}).css('transform', 'matrix(1, 0, 0, 1, ' + -_this.msgWidth + ', 0)');
			return {time: time, msgObj: _this.msgObj};
		},
		stop: function(){
			this.msgObj.css('transform','');
			return this;
		}
	};

	// 弹幕单行对象
	function DanMuLine(setting){
		this.conf = jQuery.extend({
			danMuConf: null,
			getMsgHtml: null,
		}, setting || {});
		if(!this.conf.lineNum){
			throw new Error('lineNum is not allow empty!');
		}

		this.danMuConf = this.conf.danMuConf || {};
		delete this.conf.danMuConf;

		this.lineObj = null;
		this.magList = [];// 保存所有的消息对象

	}
	DanMuLine.prototype = {
		checkLine: function(msgData){
			var _this = this;
			// 不支持就直接返回null，如果支持了就直接放入行进行后续操作
			var flag = true;
			var newTime = Math.random() * (_this.danMuConf.maxTime - _this.danMuConf.minTime) + _this.danMuConf.minTime;
			var dmm = new DanMuMsg({
				msgData: msgData,
				getMsgHtml: _this.conf.getMsgHtml,
				danMuJquery: _this.danMuConf.danMuJquery,
				time: newTime,
				lineNum: _this.conf.lineNum,
			}).init();

			var len = _this.magList.length;
			var lastMsg = null;
			if(len){
				lastMsg = _this.magList[len - 1];
				// 计算旧消息运动结束需要的时间
				var matrixStr = lastMsg.msgObj.css('transform');
				var left = 0;
				try{
					left = $.trim(matrixStr.split(',')[4]);
				}catch(e){
				}
				var lastLeft = parseInt(left);
				// 最后一条还没有完全出来就直接跳过
				if(dmWidth - lastLeft < lastMsg.msgWidth){
					flag = false;
				}else{
					var lastTime = (lastLeft + lastMsg.msgWidth) / lastMsg.speed;
					var newL = dmm.speed * lastTime;
					if(newL > dmWidth){
						flag = false;
					}
				}
			}
			if(flag){
				// 创建msg对象并放入行中
				var returnObj = dmm.play();
				setTimeout(function(){
					returnObj.msgObj.fadeOut(300,function(){
						returnObj.msgObj.remove();
						_this.magList.shift();
					});
				},returnObj.time + 2000);

				_this.magList.push(dmm);
				return dmm;
			}else{
				dmm.msgObj.remove();
				return null;
			}
		},
		getMaxLineNum: function(){
			var lineNum = 0;
			$('div[data-i]').each(function(i,ele){
				var num = parseInt($(ele).attr('data-i'));
				if(lineNum < num){
					lineNum = num;
				}
			});
			return lineNum;
		},
		getHtml: function(){
			var arr = [];
			arr.push('<div class="line" data-i="');
			arr.push(this.conf.lineNum);
			arr.push('"></div>');
			return $(arr.join(''));
		},
		appendToHtml: function(){
			var lineObj = this.getHtml();
			this.danMuConf.danMuJquery.append(lineObj);
			this.lineObj = lineObj;
		},
		init: function(){
			this.appendToHtml();
			return this;
		},
	};
	// 弹幕对象
	function DanMu(setting){
		this.conf = jQuery.extend({
			danMuJquery : $('.danMu'),
			minTime: 5000,// 最少时间
			maxTime: 10000,// 最多时间

			getMsgHtml: null,
		}, setting || {});

		this.lines = [];
	}
	DanMu.prototype = {
		init: function(){
			var _this = this;
			var danMuHeight = _this.conf.danMuJquery.height();
			var createLine = function(num){
				var dml = new DanMuLine({
					lineNum: num + 1,
					danMuConf : _this.conf,
					getMsgHtml: _this.conf.getMsgHtml,
				});
				dml.init();
				_this.lines.push(dml);
				return dml;
			};
			createLine(0);// 用于自动计算行数，如果没定义
			var lineHeight = _this.conf.lineHeight || $('.line').outerHeight(true);
			var lineCount = _this.conf.lineCount || parseInt(danMuHeight / lineHeight);
			for(var i = 1;i < lineCount; i++){
				createLine(i);
			}
			return _this;
		},
		push: function(msgObj,fn){
			if(!msgObj){
				fn && fn(msgObj);
				return;
			}
			var _this = this;
			var pushObj = function(msgObj){
				var random = parseInt(Math.random() * _this.lines.length);
				var obj = _this.lines[random].checkLine(msgObj);
				if(!obj){
					setTimeout(function(){
						pushObj(msgObj);
					},500);
				}else{
					fn && fn(msgObj);
				}
			};
			pushObj(msgObj);
			return this;
		},
	};


	/**
	 * @param  {Function} getMsgHtml 
	 *         [组装单条消息的回调方法，参数为单条数据对象]
	 * @param  {Number} lineCount:5 
	 *         [行数，和lineHeight二选一，都不配置会自动计算能放的最大行数，都配置lineHeight失效]
	 * @param  {Number} lineHeight:200 
	 *         [自定义每行所占的高度，用于计算行数，如果lineCount有配置就无效]
	 * @param  {Number} minTime:5000 
	 *         [滚动到头需要的最少时间（单位： 毫秒）]
	 * @param  {Number} maxTime:15000 
	 *         [滚动到头需要的最多时间（单位： 毫秒）]
	 * @return {Object} [返回弹幕对象，包含两个方法分别是：init()、push(itemObj)]
	 */
	$.fn.danMu = function(setting){
		var _this = $(this);

		dmWidth = _this.outerWidth(true);
		dmHeight = _this.outerHeight(true);

		setting = $.extend({
			danMuJquery: _this
		}, setting || {});
		var dm = new DanMu(setting);
		return dm;
	};
})(jQuery);