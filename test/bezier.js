function getBezierCurve (...args) {
  if (args.length > 13)
    throw new Error('最多允许13个控制点');

  let points = [[0, 0], ...args, [1, 1]];

  let l = points.length
    , segments = 500
    , i = segments + 1 // n条线段总共n + 1个点
    , xlist = Array(i)
    , ylist = Array(i)

  // 阶乘, 无需考虑大数, 限制控制点个数即可
  const factorial = cached(function factorial (n) {
    let res = 1;
    for (let i = 1; i <= n; i++)
      res *= i;
    return res;
  });

  // 组合数
  const combinatorial = cached(function combinatorial (n, m) {
    if (m > n / 2) m = n - m;
    if (m === 0) return 1;
    if (m === 1) return n;
    if (m === 2) return n * (n - 1) / 2;
    if (m === 3) return n * (n - 1) * (n - 2) / 6;

    let i = n, j = m, res = 1;
    while (j--)
      res *= i--;
    return res / factorial(m);
  });

  while (i--)
    setBezierPoint(i);

  return function bezier (x) {
    if (points.length === 2) return x;

    let i = getMaxIndex(x);

    if (i < 0) return ylist[0];
    if (i >= segments) return ylist[segments];

    let from = ylist[i], to = ylist[i + 1];

    return from + (to - from) * (x - xlist[i]);
  }

  // 二分查找x在 xlist例如[0, .02, .09, .22, ..., .99] 中哪个位置
  // 返回小于等于x的最大数的index
  function getMaxIndex (x) {
    const len = xlist.length;
    let left = 0, right = len - 1;
    if (x >= xlist[right])
      return right;

    while (left < right - 1) {
      let i = (left + right) / 2 | 0;
      let middle = xlist[i];
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
    if (index === 0) {
      let p = points[0];
      xlist[index] = p[0], ylist[index] = p[1];
      return;
    }

    if (index === segments) {
      let p = points[points.length - 1];
      xlist[index] = p[0], ylist[index] = p[1];
      return;
    }

    let x = 0, y = 0, tmp;
    let t = index / segments, n = l - 1;
    for (let i = 0; i <= n; i++) {
      tmp = combinatorial(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);

      let [px, py] = points[i];
      x += tmp * px;
      y += tmp * py;
    }

    xlist[index] = x;
    ylist[index] = y;
  }

  // 对传入fn的参数及执行之后的结果缓存
  function cached (fn) {
    const map = Object.create(null);
    return function cache (...args) {
      let key = args.join(',');
      return map[key] || (map[key] = fn(...args));
    }
  }
}

