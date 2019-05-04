/* 
 * move.js
 * @author:flfwzgl https://github.com/flfwzgl
 * @copyright: MIT license 
 */

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
    , slice = [].slice
    , toStr = ({}).toString

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
      return toStr.call(e) === '[object ' + type + ']';
    }
  }

  function each (arr, fn) {
    // if (!isArr(arr)) throw new TypeError('arr must be an array!');
    if (typeof fn !== 'function') return;
    for (var i = 0, l = arr.length; i < l; i++) {
      fn.call(arr, arr[i], i, arr);
    }
  }

  var isArr = is('Array')
    , isObj = is('Object')

  function getAnimateFn (stFn) {
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


  // 对传入fn的参数及执行之后的结果缓存
  function cached (fn) {
    var map = {};
    return function cache () {
      var args = slice.call(arguments);
      var key = args.join(',');
      return map[key] || (map[key] = fn.apply(null, args));
    }
  }

  function bezierCurve () {
    var args = slice.call(arguments);

    if (args.length > 10)
      throw new Error('The number of control points must be less than 10!');

    each(args, function (e, i) {
      if (!isArr(e))
        throw TypeError('arguments['+ i +'] must be an array!');

      if (typeof e[0] !== 'number')
        throw TypeError('arguments['+ i +'][0] must be a number!');

      if (typeof e[1] !== 'number')
        throw TypeError('arguments['+ i +'][1] must be a number!');
    });

    var points = args;

    var l = points.length
      , segments = 500
      , i = segments + 1 // n条线段总共n + 1个点
      , xlist = Array(i)
      , ylist = Array(i)

    // 阶乘, 无需考虑大数, 限制控制点个数即可
    var factorial = cached(function factorial (n) {
      var res = 1;
      for (var i = 1; i <= n; i++)
        res *= i;
      return res;
    });

    // 组合数
    var combinatorial = cached(function combinatorial (n, m) {
      if (m > n / 2) m = n - m;
      if (m === 0) return 1;
      if (m === 1) return n;
      if (m === 2) return n * (n - 1) / 2;
      if (m === 3) return n * (n - 1) * (n - 2) / 6;

      var i = n, j = m, res = 1;
      while (j--)
        res *= i--;
      return res / factorial(m);
    });

    while (i--)
      setBezierPoint(i);

    return function bezier (x) {
      if (points.length === 2) return x;

      var i = getMaxIndex(x);

      if (i < 0) return ylist[0];
      if (i >= segments) return ylist[segments];

      var from = ylist[i], to = ylist[i + 1];

      return from + (to - from) * (x - xlist[i]);
    }

    // 二分查找x在 xlist例如[0, .02, .09, .22, ..., .99] 中哪个位置
    // 返回小于等于x的最大数的index
    function getMaxIndex (x) {
      var len = xlist.length;
      var left = 0, right = len - 1;
      if (x >= xlist[right])
        return right;

      while (left < right - 1) {
        var i = (left + right) / 2 | 0;
        var middle = xlist[i];
        if (x < middle) {
          right = i;
        } else if (x > middle) {
          left = i;
        } else {
          return i;
        }
      }
      return left;
    }

    // 计算给定时间点曲线上的 (x, y) 并分别赋值到对应数组中
    function setBezierPoint (index) {
      var p;
      if (index === 0) {
        p = points[0];
        xlist[index] = p[0], ylist[index] = p[1];
        return;
      }

      if (index === segments) {
        p = points[points.length - 1];
        xlist[index] = p[0], ylist[index] = p[1];
        return;
      }

      var x = 0, y = 0, tmp;
      var t = index / segments, n = l - 1;
      for (var i = 0; i <= n; i++) {
        tmp = combinatorial(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);

        var px = points[i][0];
        var py = points[i][1];
        x += tmp * px;
        y += tmp * py;
      }

      xlist[index] = x;
      ylist[index] = y;
    }
  }



  var Move = function () {
    if (!(this instanceof Move)) return new Move();
    initMove(this);
  }
  var curve = Move.prototype;

  // 标准bezier, 首尾控制点锁定 (0, 0), (1, 1)
  curve.stdBezierCurve = function () {
    var args = slice.call(arguments);
    return bezierCurve.apply(null, [[0, 0]].concat(args, [[1, 1]]));
  };

  curve.bezierCurve = bezierCurve;
  curve.extend = function (obj) {
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

      this[name] = getAnimateFn(fn);
    }
    return this;
  }


  var initMove = function (self) {
    var PI = Math.PI
      , sin = Math.sin
      , cos = Math.cos
      , pow = Math.pow
      , abs = Math.abs
      , sqrt = Math.sqrt

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
      easeOut: self.stdBezierCurve([.5, 1]),

      // 碰撞动画
      collision: function (x) {
        var a, b;
        for (var i = 1, m = 20; i < m; i++) {
          a = 1 - (4 / 3) * pow(.5, i - 1);
          b = 1 - (4 / 3) * pow(.5, i);
          if (x >= a && x <= b) {
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
