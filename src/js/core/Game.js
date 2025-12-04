// Game.js
import Canvas from "./Canvas.js";
import Player from "../entities/Player.js";
import InputHandler from "./InputHandler.js";
import Wall from "../entities/Wall.js";
import Collision from "../physics/Collision.js";
import Enemy from "../entities/Enemy.js";
import SoundManager from "../core/SoundManager.js";

class Game {
  constructor() {
    // initialize canvas
    this.canvas = new Canvas();

    // Game State Flags
    this.isRunning = false;
    this.isGameOver = false;
    this.hasWon = false;
    this.gameHasStarted = false; // Waits for click

    // Level System
    this.currentLevel = 1;
    this.maxLevel = 5; // total number of levels
    this.levelDuration = 10; // duration for each level in seconds

    // Time Tracking
    this.lastTime = 0;
    this.timeLeft = this.levelDuration;

    // Create Inputs
    this.input = new InputHandler();

    // Create World Entities
    this.walls = this.createWalls();

    // Initialize Player & Enemies
    this.resetEntities();

    // Developer mode setup
    this.devMode = false;
    this.iniDevMode();
    this.initVolumeMixer();

    console.log("Game initialized - waiting for user start.");
  }

  // Helper to reset player and enemies (used in constructor and restart)
  resetEntities() {
    this.player = new Player(this.canvas);
    this.spawnEnemiesForLevel();
  }

  // The Entry Point: Shows "Click to Start"
  init() {
    const ctx = this.canvas.ctx;

    // Clear and draw background
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#003C57";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Start Text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "bold 40px Arial";
    ctx.fillText(
      "CLICK TO START",
      this.canvas.width / 2,
      this.canvas.height / 2,
    );

    ctx.font = "20px Arial";
    ctx.fillText(
      "Survive for 10 seconds!",
      this.canvas.width / 2,
      this.canvas.height / 2 + 40,
    );

    // Wait for user interaction to unlock Audio and Start
    window.addEventListener(
      "click",
      () => {
        if (!this.gameHasStarted) {
          this.gameHasStarted = true;

          // Resume Audio Context (Browser Requirement)
          if (typeof Howler !== "undefined" && Howler.ctx) {
            Howler.ctx.resume().then(() => {
              console.log("Audio Context Resumed");
            });
          }

          this.start();
        }
      },
      { once: true },
    );
  }

  // Define the level layout
  createWalls() {
    const wallThickness = 15;

    return [
      // Top wall - Orange
      new Wall(0, 0, this.canvas.width, wallThickness, "#FF7711"),

      // Bottom wall - Green
      new Wall(
        0,
        this.canvas.height - wallThickness,
        this.canvas.width,
        wallThickness,
        "#028368",
      ),

      // Left wall - Blue
      new Wall(0, 0, wallThickness, this.canvas.height, "#003C57"),

      // Right wall - Yellow
      new Wall(
        this.canvas.width - wallThickness,
        0,
        wallThickness,
        this.canvas.height,
        "#CEEE00",
      ),

      // Middle Platform
      new Wall(
        wallThickness,
        this.canvas.height * 0.5, // Lowered platform so it's reachable
        (this.canvas.width / 2) * 1.25,
        wallThickness,
        "#028368",
      ),
    ];
  }

  start() {
    console.log("Game Loop Starting...");
    this.isRunning = true;
    this.lastTime = performance.now();

    // Play Music
    SoundManager.play("bgm");

    // Start Loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  restart() {
    console.log("Restarting Game...");
    this.isGameOver = false;
    this.hasWon = false;
    this.currentLevel = 1;
    this.timeLeft = this.levelDuration;

    this.resetEntities();
    this.start();
  }

  checkGameStatus() {
    if (this.isGameOver) return;

    // 1. Check Win Condition (Timer)
    if (this.timeLeft <= 0) {
      this.completeLevel();
      return;
    }

    // 2. Check Lose Condition (Collision with Enemies)
    // We need a temp rect for the player because Enemy uses width/height but Player uses size
    const playerRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.size,
      height: this.player.size,
    };

    this.enemies.forEach((enemy) => {
      if (Collision.checkRectCollision(playerRect, enemy)) {
        SoundManager.play("collision");
        this.gameOver(false);
      }
    });
  }

  completeLevel() {
    if (this.currentLevel == this.maxLevel) {
      // Final Level Completed - Win Game
      this.gameOver(true);
    } else {
      // Level Completed - Advance to Next Level
      this.isRunning = false;
      this.showLevelTransition();
    }
  }

  // This was suggested by AI (Tool: Claude Sonnet 4.5 integrated within VSCode + Auto Suggestions)
  showLevelTransition() {
    const ctx = this.canvas.ctx;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 50px Arial";
    ctx.fillText(
      `Level ${this.currentLevel} Complete!`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 20,
    );

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(
      `Get ready for Level ${this.currentLevel + 1}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 20,
    );

    setTimeout(() => {
      this.nextLevel();
    }, 3000); // 3 second delay
  }

  nextLevel() {
    this.currentLevel++;
    this.timeLeft = this.levelDuration;

    // Reset player position
    this.player.x = this.canvas.width / 2 - this.player.size / 2;
    this.player.y = this.canvas.height * 0.25 - this.player.size / 2;
    this.player.velocityY = 0;

    this.spawnEnemiesForLevel();

    // Resume game loop
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  // In Game.js, update spawnEnemiesForLevel()

  spawnEnemiesForLevel() {
    this.enemies = [];
    const enemyCount = this.currentLevel;
    const wallThickness = 15;
    const enemySize = 30;
    const minDistance = enemySize * 1.5;

    // Helper to get random number in range
    const randInRange = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < enemyCount; i++) {
      let attempts = 0;
      let x, y;
      let valid;

      // --- POSITION RANDOMIZATION (Solves "Same Place" Issue) ---
      do {
        attempts++;
        x = randInRange(
          wallThickness,
          this.canvas.width - wallThickness - enemySize,
        );
        y = randInRange(wallThickness, this.canvas.height - enemySize);

        valid = true;
        // Check against existing enemies to prevent overlap
        for (const other of this.enemies) {
          const dx = other.x - x;
          const dy = other.y - y;
          if (dx * dx + dy * dy < minDistance * minDistance) {
            valid = false;
            break;
          }
        }
      } while (!valid && attempts < 50);

      // Create enemy (Constructor now handles random direction!)
      const enemy = new Enemy(x, y, this.canvas);

      // Apply Level Speed Scaling
      const speedMultiplier = 1 + (this.currentLevel - 1) * 0.2; // Lowered slightly for better balance
      enemy.velocity.mult(speedMultiplier);

      this.enemies.push(enemy);
    }
  }

  gameOver(won) {
    this.isRunning = false; // Stop the loop
    this.isGameOver = true;
    this.hasWon = won;

    // Handle Sound
    SoundManager.stop("bgm");
    if (!won) SoundManager.play("hit");

    // Log status
    const message = won ? "VICTORY!" : "GAME OVER";
    const subMessage = won ? "You survived!" : "Click to Restart";
    console.log(message);

    // Draw the end screen
    this.drawGameOverScreen(message, subMessage);

    // Add Restart Listener (with a small delay to prevent accidental double-clicks)
    setTimeout(() => {
      window.addEventListener("click", () => this.restart(), { once: true });
    }, 500);
  }

  // Main Game Loop
  gameLoop(timestamp) {
    // If not running, stop the loop
    if (!this.isRunning) return;

    // Calculate deltaTime (in seconds)
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Prevent huge time jumps if tab was inactive
    if (deltaTime < 0.1) {
      this.timeLeft -= deltaTime;
    }

    // --- UPDATE STEP ---
    this.canvas.clear();

    // Update & Draw Walls
    this.walls.forEach((wall) => wall.draw(this.canvas.ctx));

    // Update & Draw Player
    this.player.update(this.input, this.walls);
    this.player.draw(this.canvas.ctx);

    // Update & Draw Enemies
    this.enemies.forEach((enemy) => {
      enemy.update(this.walls);
      enemy.draw(this.canvas.ctx);
    });

    // Check Win/Lose
    this.checkGameStatus();

    // Draw UI (Timer)
    this.drawUI();

    // Debug Panel
    this.updateDebugPanel();

    // Reset Input flags
    this.input.update();

    // Continue Loop
    if (this.isRunning) {
      requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  // --- DRAWING HELPERS ---

  drawUI() {
    const ctx = this.canvas.ctx;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    // Show level and time
    ctx.fillText(`Level ${this.currentLevel}/${this.maxLevel}`, 20, 40);
    ctx.fillText(`Time: ${Math.max(0, Math.ceil(this.timeLeft))}`, 20, 70);
  }

  drawGameOverScreen(title, subtitle) {
    const ctx = this.canvas.ctx;
    ctx.save();

    // Semi-transparent black overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Text
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";

    ctx.font = "bold 60px Arial";
    ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 20);

    ctx.font = "30px Arial";
    ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 40);

    ctx.restore();
  }

  // --- DEBUG TOOLS ---

  iniDevMode() {
    const toggleBtn = document.getElementById("devModeToggle");
    const debugPanel = document.getElementById("debugPanel");

    if (!toggleBtn || !debugPanel) return; // Safety check

    toggleBtn.addEventListener("click", () => {
      this.devMode = !this.devMode;
      toggleBtn.textContent = `Dev Mode: ${this.devMode ? "ON" : "OFF"}`;
      toggleBtn.classList.toggle("active", this.devMode);
      debugPanel.classList.toggle("hidden", !this.devMode);
    });
  }

  initVolumeMixer() {
    const tglBtn = document.getElementById("volumeToggle");
    const vlmP = document.getElementById("volumePanel");

    if (!tglBtn || !vlmP) return;

    // Toggle panel visibility
    tglBtn.addEventListener("click", () => {
      const isHidden = vlmP.classList.toggle("hidden");
      tglBtn.classList.toggle("active", !isHidden);
    });

    // Setup volume sliders
    const setupSlider = (sliderId, valueId, type) => {
      const slider = document.getElementById(sliderId);
      const valueDisplay = document.getElementById(valueId);

      if (!slider || !valueDisplay) return;

      slider.addEventListener("input", (e) => {
        const value = e.target.value / 100;
        SoundManager.setVolume(type, value);
        valueDisplay.textContent = `${e.target.value}%`;
      });
    };

    setupSlider("masterVolume", "masterValue", "master");
    setupSlider("musicVolume", "musicValue", "music");
    setupSlider("sfxVolume", "sfxValue", "sfx");
  }

  updateDebugPanel() {
    if (!this.devMode) return;

    const debugContent = document.getElementById("debugContent");
    if (!debugContent) return;

    const collisions = this.player.collisions;

    debugContent.innerHTML = `
            <div class="debug-section">
                <h4>Game State</h4>
                <div class="debug-item">
                    <span class="debug-label">Time:</span>
                    <span class="debug-value">${this.timeLeft.toFixed(1)}</span>
                </div>
            </div>
            <div class="debug-section">
                <h4>Player Position</h4>
                <div class="debug-item">
                    <span class="debug-label">X:</span>
                    <span class="debug-value">${Math.round(this.player.x)}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Y:</span>
                    <span class="debug-value">${Math.round(this.player.y)}</span>
                </div>
            </div>
            <div class="debug-section">
                <h4>Collisions</h4>
                <div class="debug-item">
                    <span class="debug-label">Top:</span>
                    <span class="debug-value ${collisions.top ? "active" : ""}">${collisions.top}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Bottom:</span>
                    <span class="debug-value ${collisions.bottom ? "active" : ""}">${collisions.bottom}</span>
                </div>
            </div>
        `;
  }
}

export default Game;
