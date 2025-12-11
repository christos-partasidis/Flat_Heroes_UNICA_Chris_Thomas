// src/js/Game.js

import Canvas from "./Canvas.js";
import Player from "../entities/Player.js";
import InputHandler from "./InputHandler.js";
import Wall from "../entities/Wall.js";
import Collision from "../physics/Collision.js";
import Enemy from "../entities/Enemy.js";
import SoundManager from "../core/SoundManager.js";
import LevelConfig from "../utils/LevelConfig.js";

class Game {
  constructor() {
    this.canvas = new Canvas();

    this.isRunning = false;
    this.isGameOver = false;
    this.hasWon = false;
    this.gameHasStarted = false;

    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelDuration = 10;
    this.lastTime = 0;
    this.timeLeft = this.levelDuration;

    this.input = new InputHandler();

    this.walls = this.createWalls();

    window.addEventListener("resize", () => this.handleResize());

    this.resetEntities();

    this.devMode = false;
    this.iniDevMode();
    this.initVolumeMixer();
    this.createGameUI();

    console.log("Game initialized.");
  }

  // --- FIXED: Keeps Physics Walls in Sync with Canvas Size ---
  handleResize() {
    setTimeout(() => {
      // Recreate walls at new positions using LOGICAL dimensions
      this.walls = this.createWalls();

      // Keep player in bounds using LOGICAL dimensions
      if (this.player) {
        if (this.player.y > this.canvas.height) {
          this.player.y = this.canvas.height - 100;
        }
        // Also check if player is off-screen horizontally
        if (this.player.x > this.canvas.width) {
          this.player.x = this.canvas.width / 2;
        }
      }

      // Update enemy bounds
      if (this.enemies) {
        this.enemies.forEach((enemy) => {
          if (enemy.x > this.canvas.width) enemy.x = this.canvas.width - 50;
          if (enemy.y > this.canvas.height) enemy.y = this.canvas.height - 50;
        });
      }
    }, 50);
  }

  createGameUI() {
    const container = document.querySelector(".game-wrapper") || document.body;

    // Start Screen with glassmorphic effect
    this.startScreen = document.createElement("div");
    this.startScreen.className = "overlay-screen";
    this.startScreen.innerHTML = `
        <div class="glass-box">
            <h1>FLAT HEROES</h1>
            <h2 style="color: #eee; margin-bottom: 30px;">Survive the Chaos</h2>
            
            <div style="margin-bottom: 20px;">
                <label for="levelSelect" style="color: white; margin-right: 10px;">Start Level:</label>
                <select id="levelSelect" style="padding: 5px; border-radius: 5px;">
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                </select>
            </div>

            <button id="startBtn">PLAY NOW</button>
        </div>
    `;
    container.appendChild(this.startScreen);

    // Game Over Screen
    this.gameOverScreen = document.createElement("div");
    this.gameOverScreen.className = "overlay-screen hidden";
    this.gameOverScreen.innerHTML = `
        <div class="glass-box">
            <h1 id="goTitle">GAME OVER</h1>
            <h2 id="goSub" style="color: #eee; margin-bottom: 30px;">Try again?</h2>
            <button id="restartBtn">RESTART</button>
        </div>
    `;
    container.appendChild(this.gameOverScreen);

    // HUD
    this.hud = document.createElement("div");
    this.hud.className = "hidden";
    this.hud.style.cssText = `position: absolute; top: 20px; left: 50%; transform: translateX(-50%); color: white; font-size: 1.5rem; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 50; pointer-events: none;`;
    this.hud.innerHTML = `<span id="levelText">Level 1</span> <span style="margin: 0 15px; opacity: 0.5;">|</span> <span id="timerText">10s</span>`;
    container.appendChild(this.hud);
  }

  resetEntities() {
    this.player = new Player(this.canvas);
    this.spawnEnemiesForLevel();
  }

  init() {
    // Initial draw
    this.canvas.ctx.fillStyle = "#6050dc";
    this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Hook up buttons
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (!this.gameHasStarted) {
          const levelSelect = document.getElementById("levelSelect");
          if (levelSelect) {
            this.currentLevel = parseInt(levelSelect.value);
            // Reset entities to ensure correct level data is loaded
            this.resetEntities();
          }

          this.gameHasStarted = true;
          this.startScreen.classList.add("hidden");
          this.hud.classList.remove("hidden");
          if (typeof Howler !== "undefined" && Howler.ctx) Howler.ctx.resume();
          this.start();
        }
      });
    }
  }

  createWalls() {
    const wallThickness = 15;
    // Base walls (always present)
    const walls = [
      new Wall(0, 0, this.canvas.width, wallThickness, "#FF7711"), // Top
      new Wall(
        0,
        this.canvas.height - wallThickness,
        this.canvas.width,
        wallThickness,
        "#028368",
      ), // Bottom
      new Wall(0, 0, wallThickness, this.canvas.height, "#003C57"), // Left
      new Wall(
        this.canvas.width - wallThickness,
        0,
        wallThickness,
        this.canvas.height,
        "#CEEE00",
      ), // Right
    ];

    // Add layout-specific walls from LevelConfig
    const levelData = LevelConfig.getLevel(this.currentLevel);
    if (levelData && levelData.walls) {
      const levelWalls = levelData.walls(
        this.canvas.width,
        this.canvas.height,
        wallThickness,
      );
      levelWalls.forEach((w) => {
        walls.push(new Wall(w.x, w.y, w.width, w.height, w.color));
      });
    }

    return walls;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();

    // Ensure walls are correct before starting logic
    this.walls = this.createWalls();

    SoundManager.play("bgm");
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  restart() {
    this.isGameOver = false;
    this.hasWon = false;
    this.currentLevel = 1;
    this.timeLeft = this.levelDuration;
    this.resetEntities();
    this.start();
  }

  checkGameStatus() {
    if (this.isGameOver) return;
    if (this.timeLeft <= 0) {
      this.completeLevel();
      return;
    }
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
      this.gameOver(true);
    } else {
      this.isRunning = false;
      this.showLevelTransition();
    }
  }

  showLevelTransition() {
    const ctx = this.canvas.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 60px Fredoka, sans-serif";
    ctx.fillText(
      `Level ${this.currentLevel} Complete!`,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );
    ctx.restore();
    setTimeout(() => this.nextLevel(), 2000);
  }

  nextLevel() {
    this.currentLevel++;
    this.timeLeft = this.levelDuration;

    // FIXED: Reset player SAFELY to center using LOGICAL dimensions
    this.player.x = this.canvas.width / 2 - this.player.size / 2;
    this.player.y = this.canvas.height * 0.25 - this.player.size / 2;
    this.player.velocityY = 0;

    this.spawnEnemiesForLevel();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  spawnEnemiesForLevel() {
    this.enemies = [];
    const levelData = LevelConfig.getLevel(this.currentLevel);
    const enemyConfigs = levelData.enemies;

    if (!enemyConfigs) return;

    enemyConfigs.forEach((config) => {
      // Convert relative coordinates (0.0-1.0) to absolute pixels
      const x = config.x * this.canvas.width;
      const y = config.y * this.canvas.height;

      // Create enemy with config
      const enemy = new Enemy(x, y, this.canvas, config);
      this.enemies.push(enemy);
    });
  }

  gameOver(won) {
    this.isRunning = false;
    this.isGameOver = true;
    this.hasWon = won;
    SoundManager.stop("bgm");
    if (!won) SoundManager.play("hit");

    const title = document.getElementById("goTitle");
    const sub = document.getElementById("goSub");
    const restartBtn = document.getElementById("restartBtn");

    if (title) {
      title.innerText = won ? "VICTORY!" : "GAME OVER";
      title.style.background = won
        ? "linear-gradient(to right, #CEEE00, #028368)"
        : "linear-gradient(to right, #FF4B4B, #FF9090)";
      title.style.webkitBackgroundClip = "text";
      title.style.webkitTextFillColor = "transparent";
    }
    if (sub)
      sub.innerText = won
        ? "All Levels Cleared!"
        : `Died on Level ${this.currentLevel}`;

    this.gameOverScreen.classList.remove("hidden");

    if (restartBtn) {
      restartBtn.onclick = () => {
        this.gameOverScreen.classList.add("hidden");
        this.restart();
      };
    }
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (deltaTime < 0.1) this.timeLeft -= deltaTime;

    this.canvas.clear();
    this.walls.forEach((w) => w.draw(this.canvas.ctx));
    this.player.update(this.input, this.walls);
    this.player.draw(this.canvas.ctx);

    // Update & Draw Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(this.walls);

      if (enemy.isDead) {
        this.enemies.splice(i, 1);
      } else {
        enemy.draw(this.canvas.ctx);
      }
    }

    this.checkGameStatus();
    this.updateHUD();
    this.updateDebugPanel();
    this.input.update();

    if (this.isRunning) requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateHUD() {
    const lvl = document.getElementById("levelText");
    const time = document.getElementById("timerText");
    if (lvl) lvl.innerText = `Level ${this.currentLevel}/${this.maxLevel}`;
    if (time) time.innerText = `${Math.max(0, Math.ceil(this.timeLeft))}s`;
  }

  iniDevMode() {
    const btn = document.getElementById("devModeToggle");
    const panel = document.getElementById("debugPanel");
    if (btn) {
      btn.addEventListener("click", () => {
        this.devMode = !this.devMode;
        btn.textContent = `Dev Mode: ${this.devMode ? "ON" : "OFF"}`;
        panel.classList.toggle("hidden", !this.devMode);
      });
    }
  }

  initVolumeMixer() {
    const tglBtn = document.getElementById("volumeToggle");
    const vlmP = document.getElementById("volumePanel");
    if (!tglBtn) return;
    tglBtn.addEventListener("click", () => {
      vlmP.classList.toggle("hidden");
    });

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
    const content = document.getElementById("debugContent");
    if (content) {
      content.innerHTML = `
        X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}<br>
        Canvas: ${this.canvas.width}x${this.canvas.height}<br>
        Enemies: ${this.enemies.length}
      `;
    }
  }
}

export default Game;
