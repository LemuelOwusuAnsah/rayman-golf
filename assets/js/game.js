// Rayman Golf — game state
const Game = (() => {
  const state = {
    strokes: 2,
    hole: 3,
    par: 4,
    power: 0.78,
    ballPos: { x: 25, y: 60 }, // percentages inside .field
  };

  function incrementStroke() {
    state.strokes++;
    const el = document.getElementById('strokes');
    if (el) el.textContent = state.strokes;
    // Play a note per stroke (Rayman-legends vibe)
    const notes = ['C4','D4','E4','G4','A4','C5'];
    const note = notes[(state.strokes - 1) % notes.length];
    if (window.AudioEngine) AudioEngine.playNamedNote(note, 0.2, 'triangle');
  }

  function setPower(p) {
    state.power = Math.max(0, Math.min(1, p));
    const fill = document.getElementById('meter-fill');
    if (fill) fill.style.width = (state.power * 100) + '%';
  }

  function getState() { return state; }

  return { incrementStroke, setPower, getState };
})();
