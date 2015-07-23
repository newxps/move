# move.js
===
move.js 是一个js运动库, 它只会生成move一个全局变量. 

注意: move.js中所有方法是万能的方法函数, 只要是含有数字的css样式皆可过渡, 如rotate, border等复杂属性, 直接获取到的css样式值不易提取数值进行过渡, 使用move.js可以解决, 因此move.js没有设计成傻瓜式的只直接传入包含终点值的字面量对象, 如```move.ease(element, {left: 800, top:600})```(错误用法)

###安装方法
直接引入```<script src="move.min.js" type="text/javascript"></script>```

###动画种类(还在添加......)
```
linear --------- 匀速运动
ease ----------- 先加速后减速
easeIn --------- 初速度为0, 一直加速
easeOut -------- 初速度较大, 一直减速
elastic -------- 弹性动画(终点附近来回摆动)
collision ------ 碰撞动画
```

###使用方法 
直接调用 move中对应的方法即可, 例如
```
var box = document.getElementById("box");

move.collision([0, 500], 1000, function(v){
	box.style.left = v + 'px';
}, function(){
	alert('动画完成');
});
```
上面例子中调用的collision碰撞动画(其他动画同理), ```box```是要操作的dom元素, ```[0, 500]```代表从0过渡到500, 使用碰撞曲线过渡, 然后第二个参数是1000ms时间, 每次定时器执行会传入一个当前过渡值到第三个参数回调函数中,
最后一个参数是动画完成之后执行的回调函数(可不传).

####特殊情况1: 对一个或多个dom元素的多个属性进行过渡
```
var box = document.getElementById("box");
var box2 = document.getElementById("box2");

move.ease([0, 1], 1000, function(v){
	box.style.left = 500 + 300*v + 'px';	//从500过渡到800
	box.style.top = 800 + -300*v + 'px';	//从800过渡到500
	box2.style.border = 50*v + 'px solid #000';	//border宽度从0到50过渡
}, function(){
	move.collision([1, 0], 1000, function(v){
		box.style.opacity = v;
		box.style.filter = 'alpha(opacity='+ v*100 +')';	//兼容ie低版本
	}, function(){
		alert('动画完成');
	})
});
```
上面代码中第一次move.ease中是从0到1的过渡, 可以理解为是动画完成的比例, 因此回调函数中不同元素的不同属性利用百分比可以做出想要的过渡. 然后在第一个动画结束后的回调函数中执行了第二个move.collision的动画, 在第二次执行完之后执行```alert('动画完成');```


####特殊情况2: 停止正在执行的动画
因为执行所有动画方法都是返回一个函数, 执行这个函数会停止动画. 于是将此函数存放在box.stop, 如果函数存在, 则说明动画正在进行, 如果函数执行之后会删除自身,动画停止, 因此可以直接判断是否动画是否结束, 防止多次点击  
见test文件夹中stop.html
```
<input type="button" value="start" id="btn" style="width:50px;height:30px">
<div id="box" style="width:50px; height:50px; background:#f70; position:absolute; top:200px;"></div>

<script>
	var btn = document.getElementById("btn");
	var box = document.getElementById("box");

	btn.onclick = function(){
		if(box.stop) return;
		box.stop = move.ease([box.offsetLeft, 800], 1000, function(v){
			box.style.left = v + "px";
		}, function(){
			box.stop = move.collision([box.offsetLeft, 0], 1000, function(v){
				box.style.left = v + "px";
			}, function(){
				box.stop();
			})
		});
	}
	btn.onmouseout = function(){
		if(box.stop) box.stop();
	}
</script>
```


###许可协议
基于 MIT 协议, 任何用途(包括商用)皆可, [LICENSE](https://github.com/flfwzgl/move.js/blob/master/LICENSE)
