// Game.js
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
    // initialize canvas
    this.canvas = new Canvas();

    // Game State Flags
    this.isRunning = false;
    this.isGameOver = false;
    this.hasWon = false;
    this.gameHasStarted = false; 

    // Level System
    this.currentLevel = 1;
    this.selectedLevel = 1; 
    this.maxLevel = LevelConfig.getTotalLevels();

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

    // Draw Title
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 50px Arial";
    ctx.fillText("FLAT HEROES", this.canvas.width / 2, this.canvas.height * 0.2);

    // Draw Level Buttons
    this.drawLevelButtons(ctx);

    // Draw Start Button
    ctx.font = "bold 25px Arial";
    ctx.fillStyle = "#028368";
    ctx.fillRect(
      this.canvas.width / 2 - 100,
      this.canvas.height * 0.85,
      200,
      50
    );
    ctx.fillStyle = "white";
    ctx.fillText("START GAME", this.canvas.width / 2, this.canvas.height * 0.85 + 35);

    // Add click listeners
    this.canvas.canvas.addEventListener("click", (e) => this.handleMenuClick(e), { once: false });
  }

  drawLevelButtons(ctx) {
    const buttonWidth = 80;
    const buttonHeight = 80;
    const spacing = 20;
    const totalWidth = (buttonWidth + spacing) * this.maxLevel - spacing;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = this.canvas.height * 0.5;

    for (let i = 1; i <= this.maxLevel; i++) {
      const x = startX + (i - 1) * (buttonWidth + spacing);
      
      // Button background
      ctx.fillStyle = this.selectedLevel === i ? "#FF7711" : "#028368";
      ctx.fillRect(x, startY, buttonWidth, buttonHeight);

      // Level number
      ctx.fillStyle = "white";
      ctx.font = "bold 30px Arial";
      ctx.fillText(i.toString(), x + buttonWidth / 2, startY + 45);
    }
  }

  handleMenuClick(e) {
    if (this.gameHasStarted) return;

    const rect = this.canvas.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check level button clicks
    const buttonWidth = 80;
    const buttonHeight = 80;
    const spacing = 20;
    const totalWidth = (buttonWidth + spacing) * this.maxLevel - spacing;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = this.canvas.height * 0.5;

    for (let i = 1; i <= this.maxLevel; i++) {
      const x = startX + (i - 1) * (buttonWidth + spacing);
      if (
        clickX >= x &&
        clickX <= x + buttonWidth &&
        clickY >= startY &&
        clickY <= startY + buttonHeight
      ) {
        this.selectedLevel = i;
        this.init(); // Redraw menu with updated selection
        return;
      }
    }

    // Check start button click
    const startBtnX = this.canvas.width / 2 - 100;
    const startBtnY = this.canvas.height * 0.85;
    if (
      clickX >= startBtnX &&
      clickX <= startBtnX + 200 &&
      clickY >= startBtnY &&
      clickY <= startBtnY + 50
    ) {
      this.gameHasStarted = true;
      this.currentLevel = this.selectedLevel;

      // Resume Audio Context
      if (typeof Howler !== "undefined" && Howler.ctx) {
        Howler.ctx.resume().then(() => {
          console.log("Audio Context Resumed");
        });
      }

      this.start();
    }
  }

  // Updated wall creation based on layout type
  createWalls() {
    const wallThickness = 15;
    
    // Base walls (always present)
    const walls = [
      new Wall(0, 0, this.canvas.width, wallThickness, "#FF7711"), // Top
      new Wall(0, this.canvas.height - wallThickness, this.canvas.width, wallThickness, "#028368"), // Bottom
      new Wall(0, 0, wallThickness, this.canvas.height, "#003C57"), // Left
      new Wall(this.canvas.width - wallThickness, 0, wallThickness, this.canvas.height, "#CEEE00"), // Right
    ];

    // Add layout-specific walls by level number
    switch (this.currentLevel) {
      case 1:
        walls.push(
          new Wall(wallThickness, this.canvas.height * 0.5, this.canvas.width * 0.75, wallThickness, "#028368")
        );
        break;

      case 2:
        walls.push(
          
          new Wall(wallThickness, this.canvas.height * 0.5, this.canvas.width * 0.33, wallThickness, "#830270ff"),
          new Wall(this.canvas.width * 0.67, this.canvas.height * 0.5, this.canvas.width * 0.33 - wallThickness, wallThickness, "#831302ff"),
          new Wall(this.canvas.width * 0.4, this.canvas.height * 0.25, this.canvas.width * 0.6 - wallThickness, wallThickness, "#028368")
        );
        break;

      case 3:
        // No walls for level 3
        break;

      case 4:
        walls.push(
          
          new Wall(this.canvas.width * 0.625, this.canvas.height * 0.9, this.canvas.width * 0.25, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.125, this.canvas.height * 0.7, this.canvas.width * 0.25, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.625, this.canvas.height * 0.5, this.canvas.width * 0.25, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.125, this.canvas.height * 0.3, this.canvas.width * 0.25, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.85, this.canvas.height * 0.15, wallThickness, this.canvas.height * 0.15, "#028368"), 
          new Wall(this.canvas.width * 0.70, this.canvas.height * 0.3, this.canvas.width * 0.15 + wallThickness, wallThickness, "#028368")
        );
        break;

      case 5:
        walls.push(
          
          new Wall(this.canvas.width * 0.2, this.canvas.height * 0.15, this.canvas.width * 0.75, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.2, this.canvas.height * 0.5, this.canvas.width * 0.6, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.05, this.canvas.height * 0.85, this.canvas.width * 0.75, wallThickness, "#028368"),
          new Wall(this.canvas.width * 0.10, this.canvas.height * 0.15, wallThickness, this.canvas.height * 0.25, "#028368"),
          new Wall(this.canvas.width * 0.90, this.canvas.height * 0.55, wallThickness, this.canvas.height * 0.25, "#028368")
        );
        break;
    }

    return walls;
  }

  start() {
    console.log("Game Loop Starting...");
    
    // Load level configuration
    const levelConfig = LevelConfig.getLevel(this.currentLevel);
    this.levelDuration = levelConfig.duration;
    this.timeLeft = this.levelDuration;

    // Reset player/enemies so selected level settings apply before the loop starts
    this.resetEntities();
    
    // Recreate walls for selected level
    this.walls = this.createWalls();
    
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
      width: this.player.width,
      height: this.player.height,
    };

    this.enemies.forEach((enemy) => {
      if (Collision.checkRectCollision(playerRect, enemy)) {
        SoundManager.play("collision");
        this.gameOver(false);
      }
    });
  }

  completeLevel(){
    if(this.currentLevel == this.maxLevel){
      // Final Level Completed - Win Game
      this.gameOver(true);
    }else{
      // Level Completed - Advance to Next Level
      this.isRunning = false;
      this.showLevelTransition();
    }
  }

  // This was suggested by AI (Tool: Claude Sonnet 4.5 integrated within VSCode + Auto Suggestions)
  showLevelTransition(){
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
      this.canvas.height / 2 + 20
    );

    setTimeout(() => {
      this.nextLevel();
    }, 3000); // 3 second delay
  }

  nextLevel() {
    this.currentLevel++;
    
    const levelConfig = LevelConfig.getLevel(this.currentLevel);
    this.levelDuration = levelConfig.duration;
    this.timeLeft = this.levelDuration;
    
    // Recreate walls for new level
    this.walls = this.createWalls();
    
    // Reset player position
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height * 0.25 - this.player.height / 2;
    this.player.velocityY = 0;

    this.spawnEnemiesForLevel();

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  // AI generated method
  spawnEnemiesForLevel() {
    this.enemies = [];
    
    const levelConfig = LevelConfig.getLevel(this.currentLevel);
    
    if (levelConfig.enemies) {
      levelConfig.enemies.forEach(config => {
        // Convert relative coordinates (0-1) to canvas pixels
        const x = config.x * this.canvas.width;
        const y = config.y * this.canvas.height;
        
        const enemy = new Enemy(x, y, this.canvas, config.width, config.height, config.destroyOnWall);
        
        // Apply specific speed from config
        enemy.speedX = config.speedX;
        enemy.speedY = config.speedY;
        
        this.enemies.push(enemy);
      });
    }
  }

  // game over logic
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
    if (!this.isRunning) return;

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (deltaTime < 0.1) {
      this.timeLeft -= deltaTime;
    }

    // Get level config for background color
    const levelConfig = LevelConfig.getLevel(this.currentLevel);
    
    // Clear canvas once
    this.canvas.clear();
    
    // Draw level-specific background
    this.canvas.ctx.fillStyle = levelConfig.backgroundColor;
    this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & Draw Walls
    this.walls.forEach((wall) => wall.draw(this.canvas.ctx));

    // Update & Draw Player
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
    ctx.fillText(
      `Level ${this.currentLevel}/${this.maxLevel}`,
      20,
      40
    );
    ctx.fillText(
      `Time: ${Math.max(0, Math.ceil(this.timeLeft))}`,
      20,
      70
    );
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
