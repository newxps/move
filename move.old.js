

/*

======================  老代码, 仅供观赏  =========================

*/

var move = {
	css: function(obj, attr){
		if( typeof attr === "string" ){
			return obj.currentStyle ?obj.currentStyle[attr] : window.getComputedStyle(obj, false)[attr];
		}
		else if( typeof attr === "object" ){
			var a;
			for(a in attr){
				switch(a){
					case "width":
					case "height":
					case "left":
					case "top":
					case "right":
					case "padding":
					case "paddingLeft":
					case "paddingRight":
					case "paddingTop":
					case "paddingBottom":
					case "margin":
					case "marginLeft":
					case "marginRight":
					case "marginTop":
					case "marginBottom":
					case "borderRadius":
					case "borderWidth":
						if( typeof attr[a] === "number" )	obj.style[a] = attr[a] + 'px';
						else	obj.style[a] = attr[a];
						break;
					case "opacity":
						if( +attr[a] < 0 ) attr[a] = 0;
						obj.style.filter = "alpha(opacity="+ attr[a]*100 +")";
						obj.style.opacity = attr[a];
						break;
					default:
						obj.style[a] = attr[a];
				}
			}
		}
	},
	//初始化
	init: function(obj, json, time){
		if( !obj.ani ){
			obj.ani = {};				  //动画对象
			obj.ani.s0 = {},			//当前值
			obj.ani.st = {},			//目标值
			obj.ani.dis = {},			//目标值和起始值距离			
			obj.ani.va = {},			//平均速度
			obj.ani.v = {},				//初始速度,当前速度
			obj.ani.a = {},				//加速度
			obj.ani.d = {},				//t时间段内的位移
			obj.ani.res = {};			//此刻的结果
		}
		obj.aniOver = false;
		obj.ani.time = time || 500;
		obj.ani.interval = 13;
		obj.ani.total = Math.ceil( obj.ani.time/obj.ani.interval );		//定时器总次数
		obj.ani.t = 0;			//当前次数


		//如果第一次动画还没结束第二次就开始了, 就将第二次的json属性传入obj.ani.st(第一次的还在)
		//并且上一次动画的目标值不受影响
		var attr;
		for( attr in json) obj.ani.st[attr] = parseFloat(json[attr], 10);
		for( attr in obj.ani.st ){
			obj.ani.s0[attr] = parseFloat(move.css(obj, attr), 10);
		//	obj.ani.st[attr] = obj.ani.st[attr];
			obj.ani.dis[attr] = obj.ani.st[attr] - obj.ani.s0[attr];
			obj.ani.va[attr] = obj.ani.dis[attr]/obj.ani.total;
			obj.ani.d[attr] = 0;
		}
	},
	//ease-in-out 先加速,后减速
	ease: function(obj, json, time, fn){
		if( obj.aniOver === false ) clearInterval(obj.ani.timer);
		this.init(obj, json, time);

		var attr, This = this;

		//因为每一种动画的初始速度, 最大速度, 加速度不同, 所以这三个单独设置
		for( attr in obj.ani.st ){
			obj.ani.v[attr] = 0.5*obj.ani.va[attr];
			//假设最大速度是3倍平均速度,初速度是0.5倍, 因此是3-0.5
			obj.ani.a[attr] = (3-0.5)*obj.ani.va[attr]/(0.5*obj.ani.total);
		}
		obj.ani.timer = setInterval(function(){
			obj.ani.t++;
			for( attr in obj.ani.st ){
				if( Math.abs(obj.ani.d[attr]) < Math.abs(obj.ani.dis[attr]/2) ){
					obj.ani.v[attr] += obj.ani.a[attr];
					obj.ani.d[attr] += obj.ani.v[attr];
				}
				else if( Math.abs(obj.ani.d[attr])>=Math.abs(obj.ani.dis[attr]/2) && Math.abs(obj.ani.d[attr])<=Math.abs(obj.ani.dis[attr]) ){
					obj.ani.v[attr] -= obj.ani.a[attr];
					obj.ani.d[attr] += obj.ani.v[attr];
				}
				obj.ani.res[attr] = obj.ani.s0[attr] + obj.ani.d[attr];
				if( (obj.ani.v[attr] > 0 && obj.ani.res[attr] > obj.ani.st[attr]) || (obj.ani.v[attr] < 0 && obj.ani.res[attr] < obj.ani.st[attr]) ) obj.ani.res[attr] = obj.ani.st[attr];
				if( obj.ani.t > obj.ani.total ){
					clearInterval(obj.ani.timer);
					obj.aniOver = true;
					break;
				} 
			}
			move.css(obj, obj.ani.res);
			if( obj.aniOver && fn ) fn.call(obj);
		}, obj.ani.interval);
	},
	
	//缓冲动画, 初速度较大,一直减速
	easeOut: function(obj, json, time, fn){
		if( obj.aniOver === false ) clearInterval(obj.ani.timer);
		this.init(obj, json, time);

		var attr, This = this;
		//因为每一种动画的初始速度, 最大速度, 加速度不同, 所以这三个单独设置
		for( attr in obj.ani.st ){
			obj.ani.v[attr] = 5*obj.ani.va[attr];
			obj.ani.a[attr] = -6*obj.ani.va[attr]/(0.5*obj.ani.total);
		}
		obj.ani.timer = setInterval(function(){
			obj.ani.t++;
			for( attr in obj.ani.st ){
				obj.ani.v[attr] += obj.ani.a[attr];
				obj.ani.d[attr] += obj.ani.v[attr];
				obj.ani.res[attr] = obj.ani.s0[attr] + obj.ani.d[attr];
				if( (obj.ani.v[attr] > 0 && obj.ani.res[attr] > obj.ani.st[attr]) || (obj.ani.v[attr] < 0 && obj.ani.res[attr] < obj.ani.st[attr]) ){
					for( attr in obj.ani.res )	obj.ani.res[attr] = obj.ani.st[attr];
					clearInterval(obj.ani.timer);
					obj.aniOver = true;
					break;
				}
			}
			move.css(obj, obj.ani.res);
			if( obj.aniOver && fn ) fn.call(obj);
		}, obj.ani.interval);
	},
	//碰撞动画
	collision: function(obj, json, time, fn){
		if( obj.aniOver === false ) clearInterval(obj.ani.timer);
		this.init(obj, json, time);

		var attr, This = this, temp;
		//因为每一种动画的初始速度, 最大速度, 加速度不同, 所以这三个单独设置
		for( attr in obj.ani.st ){
			obj.ani.v[attr] = 2*obj.ani.va[attr];
			obj.ani.a[attr] = 6*obj.ani.va[attr]/(0.5*obj.ani.total);
		}

		obj.ani.timer = setInterval(function(){
			obj.ani.t++;

			for( attr in obj.ani.st ){
				if( obj.ani.d[attr] === obj.ani.dis[attr] ) obj.ani.v[attr]*=-0.5;
				obj.ani.v[attr] += obj.ani.a[attr];
				obj.ani.v[attr] *= 0.999;
				temp = obj.ani.dis[attr] - obj.ani.d[attr];
				if( temp*obj.ani.v[attr] > 0 && Math.abs(temp) < Math.abs(obj.ani.v[attr]) ){
					obj.ani.d[attr] += temp;
				}
				else{
					obj.ani.d[attr] += obj.ani.v[attr];
				}
				obj.ani.res[attr] = obj.ani.s0[attr] + obj.ani.d[attr];

				if( obj.ani.t > obj.ani.total ){
					for( attr in obj.ani.res )	obj.ani.res[attr] = obj.ani.st[attr];
					clearInterval(obj.ani.timer);
					obj.aniOver = true;
					break;
				}
			}
			move.css(obj, obj.ani.res);
			if( obj.aniOver && fn ) fn.call(obj);
		}, obj.ani.interval);
	},
	//弹性动画
	elastic: function(obj, json, fn){
		if( obj.aniOver === false ) clearInterval(obj.ani.timer);
		this.init(obj, json);

		var attr, This = this, factor={};
		//因为每一种动画的初始速度, 最大速度, 加速度不同, 所以这三个单独设置
		for( attr in obj.ani.st ){
			obj.ani.v[attr] = 0*obj.ani.va[attr];
			factor[attr] = 0.06;
		}
		obj.ani.timer = setInterval(function(){
			obj.ani.t++;
			for( attr in obj.ani.st ){
				obj.ani.a[attr] = (obj.ani.dis[attr] - obj.ani.d[attr])*factor[attr];
				obj.ani.v[attr] += obj.ani.a[attr];
				obj.ani.v[attr] *= 0.8;
				obj.ani.d[attr] += obj.ani.v[attr];
				obj.ani.res[attr] = obj.ani.s0[attr] + obj.ani.d[attr];

				if( Math.abs(obj.ani.v[attr]) <= 2 && Math.abs(obj.ani.dis[attr] - obj.ani.d[attr]) <= 2  ){
					factor[attr] = 0;
					obj.ani.v[attr]=0;
					obj.ani.res[attr] = obj.ani.st[attr];
				}
				if( obj.ani.t > obj.ani.total ){
					for( attr in obj.ani.res )	obj.ani.res[attr] = obj.ani.st[attr];
					clearInterval(obj.ani.timer);
					obj.aniOver = true;
					break;
				}
			}
			move.css(obj, obj.ani.res);
			if( obj.aniOver && typeof fn === "function" ) fn.call(obj);
		}, obj.ani.interval);
	},

	//万能动画, ease类型(先加速后减速)
	//from: 起始值
	//to:   终点值
	//time: 执行时间
	//fn: 每个时间隔执行此函数, 可以方便设置旋转动画,因为旋转属性css值是一个局矩阵
	//fnEnd: 动画执行完成之后回调函数
	common: function(from, to, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			total = Math.ceil(time/interval),	//总次数
			dis = to - from,
			va = dis/total,						//平均速度
			vm = va*2,							//最大速度
			a = vm/(total/2);					//加速度
			
		var v = 0, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			if( Math.abs(d) < 0.5*Math.abs(dis) ) v += a;
			else if ( Math.abs(d) > 0.5*Math.abs(dis) && Math.abs(d) < Math.abs(dis) ) v -= a;
			d += v;
			res = from + d;
			if( vm >= 0 && res >= to || vm < 0 && res <= to || t >= total ){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return true;
	}
}


 
!function(){
	//动画对象模块
	var Move = function(){};

	Move.prototype = {
		ease: function(range, duration, fn, fnEnd){
			if(!fn) return;

			var fromTime = +new Date,
					duration = duration || 500,
					curTime,
					x = 0,
					y,
					a = range[0],
					b = range[1];

			var self = this;
			var timer = 't' + Math.random();
			
			self[timer] = {};

			_move(function(){
				curTime = +new Date;
				x = (curTime - fromTime)/duration;

				y = _ease(x);

				if(y === 1 && curTime >= fromTime + duration){
					//动画结束
					fn(b);
					if(fnEnd) fnEnd();
					return true;
				} else {
					fn(a + (b - a) * y);
				}

			}, self[timer]);

			return function(){
				_stopMove(self[timer]);
				return y;
			}
		}
	}

	//兼容setInterval, requestAnimationFrame
	function _move(fn, timer){
		var step;
		try {
			console.log('this is requestAnimationFrame')
			step = function(){
				if(!fn()) timer.id = window.requestAnimationFrame(step);
			}
			step();
		} catch(e) {
			console.log('this is setInterval')			
			timer.id = setInterval(fn, 16);
		}
	}

	//停止动画
	function _stopMove(timer){
		try{
			window.cancelAnimationFrame(timer.id);
		} catch(e) {
			clearInterval(timer.id);
		}
	}

	/*动画曲线*/
	//定义域和值域均为[0, 1], 传入自变量x返回对应值y
	function _ease(x){
		if(x <= 0.5) return 2 * x * x;
		else if(x > 0.5 && x <= 1) return -2 * x * x + 4 * x - 1;
		else return 1;
	}

	return new Move;
}()
