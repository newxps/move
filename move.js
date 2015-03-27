/* move.js
 * @author:flfwzgl https://github.com/flfwzgl
 * @copyright: MIT license */
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
	}
}
