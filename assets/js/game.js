// Rayman Golf — game state + physics
const Game = (() => {
  const state = {
    strokes: 0,
    hole: 1,
    par: 4,
    power: 0.5,
    ball: { x: 25, y: 60, vx: 0, vy: 0, rolling: false, inHole: false },
    holePos: { x: 76, y: 48 },
    holeRadius: 2.2,
  };

  const FRICTION     = 3.2;
  const MIN_SPEED    = 0.6;
  const MAX_SPEED    = 55;
  const GRAVITY_PULL = 6;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function setPower(p) {
    state.power = Math.max(0, Math.min(1, p));
    const fill = document.getElementById('meter-fill');
    if (fill) fill.style.width = (state.power * 100) + '%';
  }

  function incrementStroke() {
    state.strokes++;
    const el = document.getElementById('strokes');
    if (el) el.textContent = state.strokes;
  }

  function aimVector() {
    const b = state.ball, h = state.holePos;
    const dx = h.x - b.x, dy = h.y - b.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function swing() {
    const b = state.ball;
    if (b.rolling || b.inHole) return false;
    incrementStroke();
    const speed = MIN_SPEED + Math.pow(state.power, 1.35) * MAX_SPEED;
    const dir = aimVector();
    b.vx = dir.x * speed;
    b.vy = dir.y * speed;
    b.rolling = true;
    const drift = (Math.random() - 0.5) * speed * 0.12;
    b.vx += -dir.y * drift;
    b.vy +=  dir.x * drift;
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

    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 0.01) {
      const nx = -b.vy / speed, ny = b.vx / speed;
      b.vx += nx * GRAVITY_PULL * dt;
      b.vy += ny * GRAVITY_PULL * dt;
    }

    if (b.x < 2)  { b.x = 2;  b.vx = Math.abs(b.vx) * 0.6; }
    if (b.x > 98) { b.x = 98; b.vx = -Math.abs(b.vx) * 0.6; }
    if (b.y < 2)  { b.y = 2;  b.vy = Math.abs(b.vy) * 0.6; }
    if (b.y > 98) { b.y = 98; b.vy = -Math.abs(b.vy) * 0.6; }

    if (!b.inHole && dist(b, state.holePos) < state.holeRadius) {
      const s = Math.hypot(b.vx, b.vy);
      if (s < 12) {
        b.inHole = true;
        b.rolling = false;
        b.vx = 0; b.vy = 0;
        b.x = state.holePos.x;
        b.y = state.holePos.y;
        if (window.AudioEngine) {
          ['C5','E5','G5','C6'].forEach((n, i) =>
            setTimeout(() => AudioEngine.playNamedNote(n, 0.35, 'triangle'), i * 110));
        }
        document.dispatchEvent(new CustomEvent('hole-in', { detail: { strokes: state.strokes, par: state.par } }));
      }
    }

    if (Math.hypot(b.vx, b.vy) < MIN_SPEED) {
      b.vx = 0; b.vy = 0; b.rolling = false;
      if (!b.inHole && window.AudioEngine) AudioEngine.playNamedNote('A3', 0.12, 'sine');
    }
  }

  function getRenderState() {
    return {
      ball: { ...state.ball },
      power: state.power,
      strokes: state.strokes,
      hole: state.hole,
      par: state.par,
      inHole: state.ball.inHole,
    };
  }

  function resetBall() {
    state.ball.x = 25;
    state.ball.y = 60;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.rolling = false;
    state.ball.inHole = false;
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

  return {
    setPower, incrementStroke, swing, update,
    getRenderState, resetBall, nextHole,
    getState: () => state,
  };
})();
