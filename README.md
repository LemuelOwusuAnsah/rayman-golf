# Rayman Golf

A browser-based golf interface inspired by Rayman — with musical notes
baked into the gameplay (every stroke plays a note).

## Features
- Rayman-style HUD and controls
- Aim / Swing / Power meter
- Procedural audio via the Web Audio API (no sound files needed)
- 100% static — deployable to GitHub Pages

## Structure
```
.
├── index.html
└── assets/
    ├── css/style.css
    ├── js/audio.js    # Web Audio engine
    ├── js/game.js     # Game state
    ├── js/main.js     # Wiring / entry point
    ├── audio/         # (future) sample files
    └── img/           # (future) sprites
```

## Dev
Just open index.html in a browser, or serve locally:
```bash
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Controls
- SPACE — swing
- Up / Down arrows — power up/down
- AIM button — plays a melody preview
- SWING button — plays a note, adds a stroke, nudges the ball

## Roadmap
- [ ] Real physics for the ball
- [ ] Course / hole generation
- [ ] Beat-synced musical levels (Rayman Legends style)
- [ ] Sound packs + sprite art
