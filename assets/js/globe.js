// Background wireframe globe: lat/long grid, network nodes, arcs with
// travelling pulses. Pure canvas, decorative only.
(function(){
  const canvas = document.createElement('canvas');
  canvas.className = 'globe';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CYAN = '34,211,238';
  const TILT = -0.38;
  let W, H, R, cx, cy, dpr;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 720;
    R = mobile ? W * 0.48 : Math.min(W * 0.42, H * 0.8);
    cx = W / 2;
    cy = H;
  }

  // Unit-sphere point from lat/lon (radians).
  const sph = (lat, lon) => [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];

  function project(p, rot){
    let [x, y, z] = p;
    const c = Math.cos(rot), s = Math.sin(rot);
    [x, z] = [x * c - z * s, x * s + z * c];
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    [y, z] = [y * ct - z * st, y * st + z * ct];
    return {x: cx + x * R, y: cy - y * R, z};
  }

  // Deterministic pseudo-random so the layout is stable between loads.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const nodes = Array.from({length: 46}, () => sph(Math.asin(rnd() * 1.7 - 0.85), rnd() * Math.PI * 2));
  const arcs = [];
  for(let i = 0; i < 30; i++){
    const a = nodes[(rnd() * nodes.length) | 0], b = nodes[(rnd() * nodes.length) | 0];
    const d = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2])));
    if(d < 0.35 || d > 2.2) continue;
    arcs.push({a, b, d, t: rnd(), speed: 0.06 + rnd() * 0.08});
  }

  // Great-circle interpolation, lifted off the surface toward the middle.
  function arcPoint(arc, t){
    const {a, b, d} = arc;
    const s = Math.sin(d);
    const k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
    const lift = 1 + Math.sin(Math.PI * t) * d * 0.16;
    return [(a[0]*k1 + b[0]*k2) * lift, (a[1]*k1 + b[1]*k2) * lift, (a[2]*k1 + b[2]*k2) * lift];
  }

  function line(points, rot, alphaFront, alphaBack){
    let prev = null;
    for(const p of points){
      const q = project(p, rot);
      if(prev){
        const front = (prev.z + q.z) / 2 < 0;
        ctx.strokeStyle = `rgba(${CYAN},${front ? alphaFront : alphaBack})`;
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      prev = q;
    }
  }

  const STEPS = 72;
  const meridians = [], parallels = [];
  for(let m = 0; m < 18; m++){
    const lon = m / 18 * Math.PI * 2, pts = [];
    for(let i = 0; i <= STEPS / 2; i++) pts.push(sph(-Math.PI / 2 + i / (STEPS / 2) * Math.PI, lon));
    meridians.push(pts);
  }
  for(let l = -4; l <= 4; l++){
    const lat = l / 5 * (Math.PI / 2), pts = [];
    for(let i = 0; i <= STEPS; i++) pts.push(sph(lat, i / STEPS * Math.PI * 2));
    parallels.push(pts);
  }

  function frame(time){
    const rot = time * 0.00004;
    ctx.clearRect(0, 0, W, H);

    // soft halo
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
    g.addColorStop(0, `rgba(${CYAN},0.035)`);
    g.addColorStop(1, `rgba(${CYAN},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${CYAN},0.25)`;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for(const m of meridians) line(m, rot, 0.14, 0.035);
    for(const p of parallels) line(p, rot, 0.14, 0.035);

    for(const arc of arcs){
      const pts = [];
      for(let i = 0; i <= 28; i++) pts.push(arcPoint(arc, i / 28));
      line(pts, rot, 0.38, 0.07);
      if(!reduce) arc.t = (arc.t + arc.speed * 0.016) % 1;
      const q = project(arcPoint(arc, arc.t), rot);
      const a = q.z < 0 ? 0.9 : 0.2;
      ctx.fillStyle = `rgba(${CYAN},${a})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${CYAN},${a * 0.18})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, 6, 0, Math.PI * 2); ctx.fill();
    }

    for(const n of nodes){
      const q = project(n, rot);
      const front = q.z < 0;
      ctx.fillStyle = front ? `rgba(${CYAN},0.65)` : `rgba(${CYAN},0.12)`;
      ctx.fillRect(q.x - 1.5, q.y - 1.5, 3, 3);
    }

    if(!reduce) requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);
  requestAnimationFrame(frame);
})();
