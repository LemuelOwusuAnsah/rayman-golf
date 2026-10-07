// Rayman Golf — entry point, render loop
document.addEventListener('DOMContentLoaded', () => {
  const aimBtn   = document.getElementById('btn-aim');
  const swingBtn = document.getElementById('btn-swing');
  const ball     = document.getElementById('golf-ball');
  const field    = document.getElementById('field');
  const holeCup  = document.getElementById('hole-cup');

  function unlockAudio() {
    if (window.AudioEngine) AudioEngine.ensureCtx();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  }
  document.addEventListener('click', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  function noteForPower(p) {
    const scale = ['C4','D4','E4','G4','A4','C5','D5','E5','G5'];
    return scale[Math.floor(p * (scale.length - 1))];
  }

  aimBtn?.addEventListener('click', () => {
    AudioEngine.playMelody();
  });

  swingBtn?.addEventListener('click', () => {
    const started = Game.swing();
    if (!started) return;
    AudioEngine.playNamedNote(noteForPower(Game.getState().power), 0.18, 'triangle');
    if (field) {
      field.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 220, easing: 'ease-out' }
      );
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')   { Game.setPower(Game.getState().power + 0.05); e.preventDefault(); }
    if (e.key === 'ArrowDown') { Game.setPower(Game.getState().power - 0.05); e.preventDefault(); }
    if (e.code === 'Space')    { swingBtn?.click(); e.preventDefault(); }
    if (e.key === 'r' || e.key === 'R') { Game.resetBall(); }
    if (e.key === 'n' || e.key === 'N') { Game.nextHole(); }
  });

  let last = performance.now();
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    Game.update(dt);
    const r = Game.getRenderState();

    if (ball) {
      ball.style.left = r.ball.x + '%';
      ball.style.top  = r.ball.y + '%';
      ball.classList.toggle('in-hole', r.ball.inHole);
    }

    if (holeCup) {
      const s = Game.getState();
      holeCup.style.left = (s.holePos.x - 1.6) + '%';
      holeCup.style.top  = (s.holePos.y - 0.5) + '%';
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  document.addEventListener('hole-in', (e) => {
    const { strokes, par } = e.detail;
    const diff = strokes - par;
    const msg = diff <= -2 ? 'EAGLE!' :
                diff === -1 ? 'BIRDIE!' :
                diff === 0  ? 'PAR' :
                diff === 1  ? 'BOGEY' : 'DOUBLE BOGEY+';
    console.log('[Rayman Golf]', msg, `(${strokes} strokes, par ${par})`);
    if (field) {
      field.animate(
        [
          { filter: 'brightness(1)' },
          { filter: 'brightness(1.6)' },
          { filter: 'brightness(1)' },
        ],
        { duration: 600, easing: 'ease-out' }
      );
    }
  });

  document.addEventListener('next-hole', (e) => {
    console.log('[Rayman Golf] Hole', e.detail.hole);
  });

  console.log('[Rayman Golf] ready — SPACE to swing, arrows for power, R reset, N next hole');
});
