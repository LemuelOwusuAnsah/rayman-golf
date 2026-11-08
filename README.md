# Rayman Golf

A browser-based golf game inspired by Rayman. Every stroke plays a musical note, every hole drops into a melody. Fully static, no build step, no dependencies.

Live: https://lemuelowusuansah.github.io/rayman-golf/

## Overview

A small, complete golf game rendered entirely with DOM and CSS. No canvas, no WebGL, no engine. The ball physics, aim vector, friction, wall bounce, and hole detection are all hand-rolled in about 140 lines of JavaScript. Sound is generated on the fly with the Web Audio API, so there are no asset files to load.

## Stack

Vanilla HTML, CSS, and JavaScript. Web Audio API for procedural sound. GitHub Actions for auto-deploy to Pages. No framework, no bundler, no dependencies.

## Architecture

index.html is the shell with the HUD, field, ball, club, and controls.

assets/js/audio.js is an IIFE module exposing AudioEngine. It handles AudioContext lifecycle, note-to-frequency conversion, single note playback, and a melody preview.

assets/js/game.js is an IIFE module exposing Game. It holds state (ball, hole, strokes, par, power), runs the physics in a single update(dt), and dispatches hole-in and next-hole events.

assets/js/main.js is the entry point. It wires buttons and keyboard to Game, runs the requestAnimationFrame render loop, and dispatches the appropriate audio on each swing.

assets/css/style.css is a single claymorphic stylesheet. Every visual element, including the club, hole, avatar, and HUD, is styled with pure CSS, no images.

## Features

Physics. The ball rolls with friction decay, drifts slightly off-axis on swing, bounces off the field edges with 60 percent energy loss, and settles when its speed drops below a threshold.

Hole detection. When the ball enters the hole radius at low speed, it drops in with a scale and opacity animation, and a four-note victory arpeggio plays.

Musical strokes. Every swing plays a note selected from a pentatonic scale based on the power level. The aim button previews an eight-note melody.

Controls. Space swings, Up and Down arrows adjust power, R resets the ball, N advances to the next hole. Everything is also reachable by mouse.

Responsive. The game scales down to fit smaller viewports.

## Getting started

git clone https://github.com/LemuelOwusuAnsah/rayman-golf.git
cd rayman-golf
python3 -m http.server 8000

Open http://localhost:8000. Any static file server works, this is just the shortest path.

## Controls

Space swings the club.

Up and Down arrows adjust the power meter.

R resets the ball to the start position on the current hole.

N advances to the next hole with a new random position and par.

## Project layout

index.html, the page shell.

assets/css/style.css, the entire visual style.

assets/js/audio.js, the Web Audio engine.

assets/js/game.js, the game state and physics.

assets/js/main.js, the DOM wiring and render loop.

.github/workflows/deploy.yml, the Pages deploy workflow.

## Roadmap

Shipped: physics, hole detection, musical strokes, power meter, procedural audio, multiple holes with random positions, working deploy.

Planned: course generation with themed holes, beat-synced levels in the style of Rayman Legends, sprite art to replace the emoji avatar, sound packs.

## License

MIT. See LICENSE.
