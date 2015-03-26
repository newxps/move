# move.js
===
move.js是一个js动画库, 内部包含ease(先加速后减速), easeOut(缓冲), collision(碰撞), elastic(弹性)四种常用动画方法. move.js只会生成move一个全局变量.
###安装方法
直接引入```<script src="move.js" type="text/javascript"></script>```

###使用方法
#### ease, easeOut, collision : 
```
move.ease(obj, {left:200, width:"400px"}, 1000, function(){
  alert("动画结束");
});
```
上面例子中```obj```是传入的dom元素, 传入值(有无px均可), ```1000```代表1000ms的时间, 然后是动画完成之后执行的回调函数(可不传), 如果不传入回调函数, 时间可省掉(默认500ms), 若要传入回调函数, 则必须设置时间.


#### elastic动画有点不同, 它不需要设置时间, 用法如下:
```
move.elastic(obj, {left: 800, top: 300}, function(){
  alert("动画完成");
});
```
###许可协议
基于 MIT 协议, 任何用途(包括商用)皆可, [LICENSE](https://github.com/flfwzgl/move.js/blob/master/LICENSE)
