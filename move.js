/* move.js
 * @author:flfwzgl https://github.com/flfwzgl
 * @copyright: MIT license */

!function(){
  var Move = function(){};

  var curve = Move.prototype = {
    extend: function(obj){
      for(var k in obj){
        if(k in curve){
          try{
            console.warn( k + '已经被修改!');
          } catch(e){}
        }
        curve[k] = (function(moveType){
          return function(){
            return _doMove.call(this, arguments, moveType);
          }
        })(obj[k]);
      }
    }
  }

  // move中函数传入如下参数
  // r => 过渡范围, 例如[0, 1000]   (必须传, 且传数组)
  // d => 过渡时间, ms,             (可不传, 默认500)
  // fn => 每一帧的回调函数, 传入当前过渡值v   (必须传)
  // fnEnd => 动画结束时回调               (可不传)
  // 例如: m.ease([0, 1000], 500, function(v){ ... }, fnEnd)
  // 注意: 这些参数的顺序可以打乱!!!
  window.move = new Move;


  var request = window.requestAnimationFrame;
  //兼容setInterval, requestAnimationFrame
  function _move(fn, timer){
    var step;
    try {
      step = function(){
        if(!fn()) timer.id = request(step);
      }
      step();
    } catch(e) {
      timer.id = setInterval(fn, 16);
    }
  }

  //停止动画兼容函数
  function _stopMove(timer){
    try{
      window.cancelAnimationFrame(timer.id);
    } catch(e) {
      clearInterval(timer.id);
    }
  }

  //开始动画函数
  function _doMove(arg, moveType){
    var r, d, fn, fnEnd;

    // 严格限制传入参数, 且传入的参数可以没有顺序
    for(var i = 0; i < 4; i++){
      if(typeof arg[i] === 'object' && !r) r = arg[i];
      else if(typeof arg[i] === 'number' && !d) d = arg[i];
      else if(typeof arg[i] === 'function' && !fn) fn = arg[i];
      else if(typeof arg[i] === 'function' && !fnEnd) fnEnd = arg[i];
    }

    if(!r instanceof Array || !fn) return;

    d = d || 500;

    var from = +new Date, //起始时间
        x = 0,
        y,
        a = r[0],
        b = r[1];

    var timer = 't' + Math.random();

    self = this;

    //用于保存定时器ID的对象, requestAnimation递归调用必须传入对象
    this[timer] = {};


    _move(function(){
      x = (+new Date - from)/d;

      if(x >= 1){
        // 动画结束
        fn(b);
        if(fnEnd) fnEnd();
        return true;
      } else {
        y = moveType(x);
        fn(a + (b - a) * y);
      }
    }, self[timer]);
    
    return function(){
      _stopMove(self[timer]);
      return a + (b - a) * y;
    }
  }

  var PI = Math.PI,
      sin = Math.sin,
      cos = Math.cos,
      pow = Math.pow,
      abs = Math.abs,
      sqrt = Math.sqrt;


  /*****  动画曲线  ******/

  curve.extend({
    //定义域和值域均为[0, 1], 传入自变量x返回对应值y
    //先加速后减速
    ease: function(x){
      // return -0.5*cos(PI * (2 - x)) + 0.5;
      if(x <= 0.5) return 2*x*x;
      else if(x > 0.5) return -2*x*x + 4*x - 1;
    },

    // 初速度为0 ,一直加速
    easeIn: function(x){
      return x*x;
    },

    //先慢慢加速1/3, 然后突然大提速, 最后减速
    ease2: function(x){
      return x < 1/3 ? x*x : -2*x*x + 4*x - 1;
    },

    //初速度较大, 一直减速, 缓冲动画
    easeOut: function(x){
      return pow(x, 0.8);
    },

    //碰撞动画
    collision: function(x){
      var a, b; //a, b代表碰撞点的横坐标
      for(var i = 1, m = 20; i < m; i++){
        a = 1 - (4/3) * pow(0.5, i - 1);
        b = 1 - (4/3) * pow(0.5, i);
        if(x >= a && x <= b ){
          return pow(3*(x - (a + b)/2 ), 2) + 1 - pow(0.25, i - 1);
        }
      }
    },
  
    //弹性动画
    elastic: function(x){
      return -pow(1/12, x) * cos( PI*2.5*x*x ) + 1;
    },

    //匀速动画
    linear: function(x){
      return x;
    },

    //断断续续加速减速
    wave: function(x){
      return (1/12)*sin( 5*PI*x ) + x;
    },
    
    //先向反方向移动一小段距离, 然后正方向移动, 并超过终点一小段, 然后回到终点
    opposite: function(x){
      return (sqrt(2)/2)*sin( (3*PI/2)*(x - 0.5) ) + 0.5;
    }
    
  })

}();
