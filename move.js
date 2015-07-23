var move = {
	//投射函数, 非动画函数
	//传入组定义域和值域都可以是多元数组
	project: function(x, domain, range){
		if(domain.length !== range.length) return;
		var len = domain.length;
		if(x <= domain[0]) return range[0];
		else if(x >= domain[len-1]) return range[len-1];
		else {
			for(var i=0; i<len-1; i++){
				if(x >= domain[i] && x < domain[i+1]) return range[i] + ( (x - domain[i])/(domain[i+1] - domain[i]) )*(range[i+1] - range[i]);
			}
		}
	},

	collision: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			total = Math.ceil(time/interval),
			dis = to - from,
			va = dis/Math.ceil(total/4),
			a = va/Math.ceil(total/4);

		var v = 0, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			v += a;
			d += v;
			if((dis > 0 && d > dis) || (dis < 0 && d < dis)){
				d = dis;
				v *= -0.5;
			}
			res = from + d;
			if(t > total){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	},
	
	elastic: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			total = Math.ceil(time/interval),
			dis = to - from,
			va = dis/Math.ceil(total/4),
			a = va/Math.ceil(total/4);

		var v = 0, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			v += a;
			d += v;
			if((a > 0 && d > dis) || (a < 0 && d < dis) ){
				d = dis;
			}
			if(d === dis) a *= -2;
			res = from + d;
			if(t > total){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	},

	linear: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			dis = to - from,
			total = Math.ceil(time/interval),
			va = dis/total;

		var d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			d += va;
			res = from + d;
			if( (va >= 0 && res >= to) || (va < 0 && res <= to) || t > total){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	},

	easeIn: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			total = Math.ceil(time/interval),
			dis = to - from,
			va = dis/total,
			a = va/(total/2);

		var v = 0, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			v += a;
			d += v;
			res = from + d;
			if( (va >= 0 && res + v >= to) || (va < 0 && res + v <= to) || t > total){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	},

	//easeOut动画(初速度较大, 一直减速)
	//range = [from, to]
	//time: 执行时间
	//fn: 每个时间隔执行此函数, 可以方便设置旋转动画,因为旋转属性css值是一个局矩阵
	//fnEnd: 动画执行完成之后回调函数
	easeOut: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			total = Math.ceil(time/interval),	//总次数
			dis = to - from,
			va = dis/total,						//平均速度
			a = -va * move.project(time, [100, 200, 300, 500, 1000, 5000, 10000], [1.8, 1.85, 1.92, 1.95, 1.97, 1.985, 1.995])/total;					//加速度
			
		var v = va*2, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			v += a;
			d += v;
			res = from + d;
			if( (va >= 0 && res + v >= to) || (va < 0 && res + v <= to) || t > total){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	},

	//ease动画(先加速后减速)
	//range = [from, to]
	//time: 执行时间
	//fn: 每个时间隔执行此函数, 可以方便设置旋转动画,因为旋转属性css值是一个局矩阵
	//fnEnd: 动画执行完成之后回调函数
	ease: function(range, time, fn, fnEnd){
		if(!fn) return;
		var interval = 13,
			from = range[0],
			to = range[1],
			total = Math.ceil(time/interval),	//总次数
			dis = to - from,
			va = dis/total,						//平均速度
			a = va*1.7/(total/2);					//加速度
			
		var v = va*0.3, d = 0, res, t = 0;

		var timer = setInterval(function(){
			t++;
			if( Math.abs(d) < 0.5*Math.abs(dis) ) v += a;
			else if ( Math.abs(d) > 0.5*Math.abs(dis) && Math.abs(d) < Math.abs(dis) ) v -= a;
			d += v;
			res = from + d;
			if( va >= 0 && res >= to || va < 0 && res <= to || t >= total ){
				clearInterval(timer);
				res = to;
				fn(res);
				if(fnEnd) fnEnd();
			}
			else fn(res);
		}, interval);
		return function(){
			clearInterval(timer);
			delete this.stop;
		};
	}
}