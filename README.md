# Flat Heroes
This repository contains our implementation of a simplified version of the game **Flat Heroes**, developed as part of the *JavaScript Course* by [Professor Michel Buffa](https://ds4h.univ-cotedazur.eu/education/minor-web-technologies-javascript-introduction).

## Contributors
[Christos Partasidis](https://www.linkedin.com/in/christos-partasidis/) and [Thomas Dessolier](https://www.linkedin.com/in/thomas-dessolier-114a0a330/)

## Getting Started & Our Approach

Check the official [Project Instructions](https://docs.google.com/document/d/1J3Plq-NQ9sH1R-qfy0rXbArGAastqqOt-TpacPRRUro/edit?tab=t.0#heading=h.bix920o6dsic) for all requirements.

We took it further than the spec, basing our gameplay on this [reference video](https://www.youtube.com/watch?v=A3dlIiNVgVU). The original design felt a bit dull, so we modernised it with:

- **Vibrant colours** + **glassmorphism effects** (transparency, blur overlays)
- **Fredoka Google Font** - fresh, readable, and accessible
- **Volume mixer** (master starts at 0% - perfect for sneaky classroom demos!)
- **Dev Mode toggle** for debugging positions/enemy counts

**Accessibility note:** Wall colours need a contrast tweak (quick fix for production). We prioritised getting all mechanics rock-solid first.

**Pro tip:** Use a local server (Python/VSCode Live Server) for SoundManager to work properly.
## Game Concept & Gameplay

In Flat Heroes, you control a small square hero who must navigate maze-like wall layouts while dodging waves of red enemy squares in this tense survival game. The enemies move in straight lines (up, down, left or right) and either bounce off walls or explode on impact, depending on the level configuration.

**Core Loop:**
1. The level starts with a countdown timer (13–30 seconds, depending on the level).
2. Enemies spawn with staggered delays (domino/rain effects in the early levels)
3. Use WASD or the arrows to move your hero and avoid collision.
4. Touch an enemy and it's game over. Smash the enemy into a wall (if `destroyOnWall` is set to true) to see particles and hear a sound.
5. Survive the timer to complete the level and move on to the next one.
6. Clear all 5 levels = victory!

We drew inspiration from the [original gameplay video](https://www.youtube.com/watch?v=A3dlIiNVgVU) but made it our own with modern UI and extra polish.

## Technical Architecture

Modular vanilla JavaScript structure with separation of concerns:

- **Canvas.js**: Responsive 2D rendering context
- **Game.js**: Main `requestAnimationFrame` loop with delta-time timing, level progression, entity management
- **Entities**: OOP classes (`Player.js`, `Enemy.js`, `Wall.js`, `Particle.js`) with `update()`/`draw()` separation
- **Physics**: Rectangle collision detection with position correction and velocity reversal (`Collision.js`)
- **LevelConfig.js**: Data-driven levels with relative positioning and dynamic enemy generators
- **InputHandler.js**: WASD/Arrow key controls

## Key Features

- **Responsive design** with logical-to-pixel coordinate conversion
- **Particle explosion effects** on enemy destruction
- **SoundManager** with volume mixer (master/music/SFX sliders - defaults to silent for classroom use)
- **Dev Mode** toggle (player position, canvas size, enemy count)
- **5 levels** with transition screens and countdown timers
- **Glassmorphism UI** with Fredoka font and vibrant gradients

## Design Choices

- Modern glassmorphic overlays and vibrant color palette
- Fredoka Google font for accessibility and style
- Silent master volume by default (classroom-friendly)
- HUD shows level progress and remaining time

## Known Issues & Fixes

**Enemy spawn delays** are frame-based (FPS sensitive). Fixed by reducing `delay` values in `LevelConfig.js`:
- Level 1: `i * 10` → `i * 2`
- Level 2: `startDelay = 180` → `60`

**Levels 3-5** initially had empty `enemies: []`. Fixed by adding `get enemies()` getters reusing level 1/2 patterns.

## How to Run

1. Clone the repository
2. Launch a Python HTTP server or use the Live Server extensions if using VSCode or any other  IDEs
3. Use **WASD** or **Arrow Keys** to move
4. Toggle **Dev Mode** and **Volume** from UI

## Future Enhancements

**Technical:**
- Real-time delays (`delay -= deltaTime * 60`) instead of frame counts
- Procedural level generation (wall/enemy patterns)
- Object pooling for particles/enemies

**Features:**
- Mobile touch controls (virtual joystick)
- LocalStorage high scores
- Pause menu
- Settings persistence

**Polish:**
- Wall colour contrast fixes
- Screen reader announcements
- PWA installable

## Learning Outcomes
**The project yielded the following insights:**
- The architecture is characterised by its clean, modular design, which is implemented using vanilla JavaScript.
- The utilisation of the requestAnimationFrame method in conjunction with the deltaTime parameter is a proven technique for achieving seamless animation.
- The present study explores the application of data-driven design, specifically the LevelConfig pattern, in the field of design.
- The application of responsive canvas scaling is a key consideration in this field.
- The resolution of collisions, i.e. the correction of position, is of paramount importance.
- The following CSS techniques are utilised in a contemporary context: glassmorphism and backdrop-filter.
- The integration of audio components and the management of audio volume.

## Links

- [Project Spec](https://docs.google.com/document/d/1J3Plq-NQ9sH1R-qfy0rXbArGAastqqOt-TpacPRRUro/edit?tab=t.0#heading=h.bix920o6dsic)
- [Gameplay Video](https://www.youtube.com/watch?v=A3dlIiNVgVU)

Cheers!
