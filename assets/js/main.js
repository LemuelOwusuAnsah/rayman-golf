// Rayman Golf — entry point / wiring
document.addEventListener('DOMContentLoaded', () => {
  const aimBtn   = document.getElementById('btn-aim');
  const swingBtn = document.getElementById('btn-swing');
  const ball     = document.getElementById('golf-ball');
  const field    = document.getElementById('field');

  // Unlock audio on first user gesture
  function unlockAudio() {
    if (window.AudioEngine) AudioEngine.ensureCtx();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  }
  document.addEventListener('click', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  // AIM — plays a little melody preview
  aimBtn?.addEventListener('click', () => {
    AudioEngine.playMelody(0.2);
  });

  // SWING — adds a stroke, plays a note, nudges the ball
  swingBtn?.addEventListener('click', () => {
    Game.incrementStroke();
    // Small random nudge toward the hole
    const s = Game.getState();
    s.ballPos.x = Math.min(90, s.ballPos.x + 8 + Math.random() * 6);
    s.ballPos.y = Math.min(85, s.ballPos.y + (Math.random() * 6 - 3));
    if (ball) {
      ball.style.left = s.ballPos.x + '%';
      ball.style.top  = s.ballPos.y + '%';
    }
    if (field) {
      field.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }],
        { duration: 220, easing: 'ease-out' }
      );
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')   Game.setPower(Game.getState().power + 0.05);
    if (e.key === 'ArrowDown') Game.setPower(Game.getState().power - 0.05);
    if (e.key === ' ')         swingBtn?.click();
  });

  console.log('[Rayman Golf] ready — press SPACE to swing, ↑/↓ to adjust power');
});
