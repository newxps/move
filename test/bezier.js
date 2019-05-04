
function addBezierTo (opt = {}) {
  let {
    el,
    points
  } = opt;

  if (!(el instanceof Element)) throw new TypeError('opt.el must be an element!');
  if (!Array.isArray(points)) throw new TypeError('opt.points must be an array!');
  if (points.some(e => !(e && typeof e === 'object'))) throw new TypeError('opt.points must be composed entirely of objects!');

  let width = el.offsetWidth;
  let height = el.offsetHeight;

  const x = d => d.x;
  const y = d => d.y;
  let padding = 110
    , w = el.offsetWidth - padding * 2
    , h = el.offsetHeight - padding * 2


  let p = points;
  points = points.map(e => {
    return {
      x: e.x * w,
      y: h - e.y * h
    }
  });

  let t = 1
    , delta = .01
    , bezier = {}
    , line = d3.svg.line().x(x).y(y)
    , l = points.length
    , n = l - 1
    , orders = d3.range(l, l + 1)

  let svg = d3.select(el).selectAll('svg')
      .data(orders)
    .enter().append('svg:svg')
      .attr('width', width)
      .attr('height', height)
    .append('svg:g')
      .attr('transform', 'translate(' + padding + ',' + padding + ')');

  update();

  svg.selectAll('circle.control')
      .data(d => points.slice(0, d))
    .enter().append('svg:circle')
      .attr('class', 'control')
      .attr('r', (d, i) => {
        // return i === 0 || i === points.length - 1 ? 3 : 3
        return 3
      })
      .attr('style', (d, i) => {
        return i === 0 || i === points.length - 1 ? 'fill: red; stroke: none' : 'fill: #fff; stroke: #20a0ff; stroke-width: 2px'
      })
      .attr('cx', x)
      .attr('cy', y)
      // .call(d3.behavior.drag()
      //   .on('dragstart', function (d, i) {
      //     this.__origin__ = [d.x, d.y];
      //   })
      //   .on('drag', function (d, i) {
      //     d.x = Math.min(w, Math.max(0, this.__origin__[0] += d3.event.dx));
      //     d.y = Math.min(h, Math.max(0, this.__origin__[1] += d3.event.dy));
      //     bezier = {};
      //     update();
      //     svg.selectAll('circle.control')
      //       .attr('cx', x)
      //       .attr('cy', y);
      //   })
      //   .on('dragend', function () {
      //     delete this.__origin__;
      //   })
      // );

  svg.append('svg:text')
    .attr('class', 't')
    .attr('x', w / 2)
    .attr('y', h)
    .attr('text-anchor', 'middle');

  svg.selectAll('text.controltext')
      .data(d => points.slice(0, d))
    .enter().append('svg:text')
      .attr('class', 'controltext')
      .attr('dx', (d, i) => {
        let dx = p[i].dx;
        return dx == null ? '-20px' : dx;
      })
      .attr('dy', (d, i) => {
        let dy = p[i].dy;
        return dy == null
          ? p[i].y > .5 ? '-10px' : '20px'
          : dy
      })
      .text((d, i) => `P${i}(${p[i].x},${p[i].y})`);

  let last = 0;
  d3.timer(elapsed => {
    t = (t + (elapsed - last) / 5000) % 1;
    last = elapsed;
    update();
  });

  update();

  function update () {
    let interpolation = svg.selectAll('g')
        .data(d => getLevels(d, t));
    interpolation.enter().append('svg:g')
        .style('fill', colour)
        .style('stroke', colour);

    let circle = interpolation.selectAll('circle')
        .data(Object);
    circle.enter().append('svg:circle')
        .attr('r', 2);
    circle
        .attr('cx', x)
        .attr('cy', y);

    let path = interpolation.selectAll('path')
        .data(d => [d]);
    path.enter().append('svg:path')
        .attr('class', 'line')
        .attr('d', line);
    path.attr('d', line);

    let curve = svg.selectAll('path.curve')
        .data(getCurve);
    curve.enter().append('svg:path')
        .attr('class', 'curve');
    curve.attr('d', line);

    svg.selectAll('text.controltext')
        .attr('x', x)
        .attr('y', y);
  }

  function interpolate (d, p) {
    if (arguments.length < 2) p = t;
    let r = [];
    for (let i = 1; i < d.length; i++) {
      let d0 = d[i-1], d1 = d[i];
      r.push({x: d0.x + (d1.x - d0.x) * p, y: d0.y + (d1.y - d0.y) * p});
    }
    return r;
  }

  function getLevels (d, tt) {
    if (arguments.length < 2) tt = t;
    let x = [points.slice(0, d)];
    for (let i = 1; i < d; i++) {
      x.push(interpolate(x[x.length - 1], tt));
    }
    return x;
  }

  function getCurve (d) {
    let curve = bezier[d];
    if (!curve) {
      curve = bezier[d] = [];
      for (let tt = 0; tt <= 1; tt += delta) {
        let x = getLevels(d, tt);
        curve.push(x[x.length - 1][0]);
      }
    }
    return [curve.slice(0, t / delta + 1)];
  }

  function colour (d, i) {
    return d.length > 1 ? ['#ccc', '#6b0', '#09c', '#a7d'][i] : 'red';
  }
}

document.body.addEventListener('touchmove', ev => ev.preventDefault());
