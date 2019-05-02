/* move.js
 * @author:flfwzgl https://github.com/flfwzgl
 * @copyright: MIT license */

;(function (global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.move = factory();
  }
})(typeof window === 'object' ? window : this, function () {
  var T = 1000 / 60
    , request = window.requestAnimationFrame
    , stopRequest = window.cancelAnimationFrame
    , interval
    , stopInterval

  interval = request
    ? function (fn, timer) {
      var step = function () {
        if (!fn()) timer.id = request(step);
      }
      step()
    }
    : function (fn, timer) {
      timer.id = setInterval(fn, T);
    }

  stopInterval = stopRequest
    ? function (timer) {
      stopRequest(timer.id);
    }
    : function (timer) {
      clearInterval(timer.id);
    }

  function is (type) {
    return function (e) {
      return Object.prototype.toString.call(e) === '[object ' + type + ']';
    }
  }

  var isArr = is('Array');
  var isObj = is('Object');

  function getAnimation (stFn) {
    if (typeof stFn !== 'function')
      throw new TypeError('stFn must be a function, and must return a number of 0-1');

    return function animate (range, t, fn, fnEnd) {
      if (!isArr(range))
        throw new TypeError('range must be an array of two number elements!');

      if (!fnEnd) {
        if (typeof fn === 'function') {
          if (typeof t === 'function') {
            fnEnd = fn;
            fn = t;
          }
        } else {
          if (typeof t === 'function') {
            fn = t;
            t = 500;
          }
        }
      }

      if (typeof t !== 'number')
        throw new TypeError('t must be a number');

      if (typeof fn !== 'function')
        throw new TypeError('fn must be a function');

      var start = range[0]
        , end = range[1]

      if (typeof start !== 'number')
        throw new TypeError('The first el of range must be a number');

      if (typeof end !== 'number')
        throw new TypeError('The second el of range must be a number');

      if (start === end)
        return fnEnd && fnEnd();

      var total = Math.ceil(t / T)
        , i = 0
        , val
        , percentage
        , timer = {}

      interval(function () {
        percentage = ++i / total;

        val = start + (end - start) * stFn(percentage);
        fn(val, percentage);

        if (i >= total) {
          stopInterval(timer);
          fnEnd && fnEnd();
          return true;
        }
      }, timer);

      return function stopAnimate () {
        stopInterval(timer);
        return val;
      }
    }
  }

  var Move = function () {
    if (!(this instanceof Move)) return new Move();
    initMove(this);
  }

  Move.prototype.extend = function (obj) {
    if (!isObj(obj))
      throw new TypeError('obj must an Object!');

    var fn;
    for (var name in obj) {
      if (!obj.hasOwnProperty(name)) continue;
      if (name in this)
        throw new Error(name + ' has been registed!');

      fn = obj[name];

      if (typeof fn !== 'function')
        throw new TypeError('obj.' + name + ' must be a function!');

      this[name] = getAnimation(fn);
    }
  }

  var PI = Math.PI
    , sin = Math.sin
    , cos = Math.cos
    , pow = Math.pow
    , abs = Math.abs
    , sqrt = Math.sqrt

  var initMove = function (self) {
    self.extend({
      ease: function (x) {
        return x <= .5
          ? 2 * x * x
          : -2 * x * x + 4 * x - 1
      },

      easeIn: function (x) {
        return x * x;
      },

      // 先慢慢加速1/3, 然后突然大提速, 最后减速
      ease2: function (x) {
        return x < 1 / 3
          ? x * x
          : -2 * x * x + 4 * x - 1;
      },

      // 初速度较大, 一直减速, 缓冲动画
      easeOut: function (x) {
        return pow(x, 0.8);
      },

      // 碰撞动画
      collision: function (x) {
        var a, b;
        for (var i = 1, m = 20; i < m; i++) {
          a = 1 - (4 / 3) * pow(.5, i - 1);
          b = 1 - (4 / 3) * pow(.5, i);
          if (x >= a && x <= b ) {
            return pow(3 * (x - (a + b) / 2), 2) + 1 - pow(.25, i - 1);
          }
        }
      },
    
      // 弹性动画
      elastic: function (x) {
        return -pow(1 / 12, x) * cos(PI * 2.5 * x * x ) + 1;
      },

      // 匀速动画
      linear: function (x) {
        return x;
      },

      // 断断续续加速减速
      wave: function (x) {
        return (1 / 12) * sin(5 * PI * x) + x;
      },
      
      // 先向反方向移动一小段距离, 然后正方向移动, 并超过终点一小段, 然后回到终点
      opposite: function (x) {
        return (sqrt(2) / 2) * sin((3 * PI / 2) * (x - .5)) + .5;
      }
    });
  }

  return Move;
}());
