// Rayman Golf — game state + physics
const Game = (() => {
  const state = {
    strokes: 0,
    hole: 1,
    par: 4,
    power: 0.5,
    aim: 0,
    ball: { x: 25, y: 60, vx: 0, vy: 0, rolling: false, inHole: false },
    holePos: { x: 76, y: 48 },
    holeRadius: 2.2,
  };

  const FRICTION     = 2.1;
  const MIN_SPEED    = 0.4;
  const MAX_SPEED    = 110;
  const WALL_BOUNCE  = 0.6;
  const AIM_STEP     = 0.05;
  const AIM_MIN      = -Math.PI * 0.95;
  const AIM_MAX      =  Math.PI * 0.95;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function setPower(p) {
    state.power = Math.max(0, Math.min(1, p));
    const fill = document.getElementById('meter-fill');
    if (fill) fill.style.width = (state.power * 100) + '%';
  }

  function adjustAim(delta) {
    state.aim = Math.max(AIM_MIN, Math.min(AIM_MAX, state.aim + delta));
  }

  function aimToHole() {
    const b = state.ball, h = state.holePos;
    state.aim = Math.atan2(h.y - b.y, h.x - b.x);
  }

  function incrementStroke() {
    state.strokes++;
    const el = document.getElementById('strokes');
    if (el) el.textContent = state.strokes;
  }

  function swing() {
    const b = state.ball;
    if (b.rolling || b.inHole) return false;
    incrementStroke();
    const speed = MIN_SPEED + Math.pow(state.power, 1.35) * MAX_SPEED;
    b.vx = Math.cos(state.aim) * speed;
    b.vy = Math.sin(state.aim) * speed;
    b.rolling = true;
    return true;
  }

  function update(dt) {
    const b = state.ball;
    if (!b.rolling) return;

    b.x += b.vx * dt;
    b.y += b.vy * dt;

    const decay = Math.exp(-FRICTION * dt);
    b.vx *= decay;
    b.vy *= decay;

    if (b.x < 2)  { b.x = 2;  b.vx = Math.abs(b.vx) * WALL_BOUNCE; }
    if (b.x > 98) { b.x = 98; b.vx = -Math.abs(b.vx) * WALL_BOUNCE; }
    if (b.y < 2)  { b.y = 2;  b.vy = Math.abs(b.vy) * WALL_BOUNCE; }
    if (b.y > 98) { b.y = 98; b.vy = -Math.abs(b.vy) * WALL_BOUNCE; }

    if (!b.inHole && dist(b, state.holePos) < state.holeRadius) {
      const s = Math.hypot(b.vx, b.vy);
      if (s < 12) {
        b.inHole = true;
        b.rolling = false;
        b.vx = 0;
        b.vy = 0;
        b.x = state.holePos.x;
        b.y = state.holePos.y;
        if (window.AudioEngine) {
          ['C5', 'E5', 'G5', 'C6'].forEach((n, i) =>
            setTimeout(() => AudioEngine.playNamedNote(n, 0.35, 'triangle'), i * 110)
          );
        }
        document.dispatchEvent(
          new CustomEvent('hole-in', { detail: { strokes: state.strokes, par: state.par } })
        );
      }
    }

    if (Math.hypot(b.vx, b.vy) < MIN_SPEED) {
      b.vx = 0;
      b.vy = 0;
      b.rolling = false;
      if (!b.inHole && window.AudioEngine) AudioEngine.playNamedNote('A3', 0.12, 'sine');
    }
  }

  function getRenderState() {
    return {
      ball: { ...state.ball },
      power: state.power,
      aim: state.aim,
      strokes: state.strokes,
      hole: state.hole,
      par: state.par,
      inHole: state.ball.inHole,
      holePos: { ...state.holePos },
    };
  }

  function resetBall() {
    state.ball.x = 25;
    state.ball.y = 60;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.rolling = false;
    state.ball.inHole = false;
    aimToHole();
  }

  function nextHole() {
    state.hole++;
    state.strokes = 0;
    state.holePos.x = 55 + Math.random() * 35;
    state.holePos.y = 25 + Math.random() * 45;
    state.par = 3 + Math.floor(Math.random() * 3);
    resetBall();
    const hEl = document.getElementById('hole-number');
    const pEl = document.querySelector('.hole-info .par');
    const sEl = document.getElementById('strokes');
    if (hEl) hEl.textContent = state.hole;
    if (pEl) pEl.textContent = 'PAR ' + state.par;
    if (sEl) sEl.textContent = state.strokes;
    document.dispatchEvent(new CustomEvent('next-hole', { detail: { hole: state.hole } }));
  }

  aimToHole();

  return {
    setPower,
    adjustAim,
    incrementStroke,
    swing,
    update,
    getRenderState,
    resetBall,
    nextHole,
    getState: () => state,
  };
})();
