# Way to Nimarjanam

Way to Nimarjanam is a 3D devotional river journey game built with React, React Three Fiber, Three.js, Vite, and Zustand.

## Setup

Requirements:

- Node.js 18 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The project commonly runs at `http://localhost:3000/`.

Create a production build with:

```bash
npm run build
```

## Controls

- `A` / `Left Arrow`: steer left
- `D` / `Right Arrow`: steer right
- Drag horizontally: steer on touch or pointer devices
- `F3`: toggle debug telemetry
- `B`: spawn a test plastic bottle during gameplay

The pause menu contains resume, restart, sound, settings, and return-home actions.

## Gameplay

- Guide the traditional wooden boat through five river and ocean levels.
- Collect plastic covers, plastic bottles, fishing nets, lotus flowers, diyas, and Om coins.
- Plastic items award 10 Punya and count toward the trash objective.
- Sacred items award 20 Punya.
- Checkpoints save distance, score, collection totals, and health.
- Collected items are removed immediately and cannot score twice.

## Audio

Sound starts after `START HERE` and follows the in-game sound setting. To use a real devotional recording, place an original or properly licensed vocals-only file at:

```text
public/audio/ganapathi-vocals.mp3
```

No copyrighted song is included in this repository. When the file is absent, supported browsers can use the built-in vocal chant fallback for phrases such as `Ganapathi Bappa Morya!` and `Jai Ganesh!`.

## Project Structure

- `src/components/game`: 3D boat, environments, collectibles, obstacles, and spawning
- `src/components/ui`: HUD, menus, checkpoint messages, and score popups
- `src/store`: gameplay state, movement, scoring, checkpoints, and progression
- `src/data/levelsConfig.ts`: five level configurations and scoring rules
- `src/services`: audio and local progress persistence

## License and Assets

Only use original or properly licensed audio and visual assets when extending the game.