// Rayman Golf — audio engine
const AudioEngine = (() => {
  let ctx = null;

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function playNote(freq = 440, duration = 0.25, type = 'sine') {
    const c = ensureCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain).connect(c.destination);
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  const NOTE_OFFSETS = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };
  function noteToFreq(note) {
    const m = /^([A-G]#?)(-?\d)$/.exec(note);
    if (!m) return 440;
    const semitone = NOTE_OFFSETS[m[1]];
    const octave = parseInt(m[2], 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playNamedNote(name = 'C4', duration = 0.25, type = 'sine') {
    playNote(noteToFreq(name), duration, type);
  }

  const MELODY = ['C4','E4','G4','C5','B4','G4','E4','C4'];
  function playMelody() {
    MELODY.forEach((n, i) => setTimeout(() => playNamedNote(n, 0.3), i * 220));
  }

  return { playNote, playNamedNote, noteToFreq, playMelody, ensureCtx };
})();
