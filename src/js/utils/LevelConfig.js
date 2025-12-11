// LevelConfig.js - Contains configuration for all game levels
class LevelConfig {
  static getLevel1Enemies() {
    const enemies = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: (i + 0.5) / count, // Distribute evenly across width
        y: 0.05, // Start near top
        speedX: 0,
        speedY: 3, // Move down
        width: 7,
        height: 30,
        destroyOnWall: true
      });
    }
    return enemies;
  }

  static levels = {
    1: {
      duration: 15,
      backgroundColor: "#A9B8B0",
      description: "Rain of arrows",
      get enemies() { return LevelConfig.getLevel1Enemies(); }
    },
    2: {
      duration: 20,
      backgroundColor: "#A9B8B0",
      description: "Multiple enemies appear",
      enemies: [
        { x: 0.1, y: 0.1, speedX: 4, speedY: 4 },
        { x: 0.9, y: 0.1, speedX: -4, speedY: 4 }
      ]
    },
    3: {
      duration: 25,
      backgroundColor: "#A9B8B0",
      description: "Navigate through obstacles",
      enemies: [
        { x: 0.1, y: 0.1, speedX: 5, speedY: 5 },
        { x: 0.5, y: 0.1, speedX: 0, speedY: 6 },
        { x: 0.9, y: 0.1, speedX: -5, speedY: 5 }
      ]
    },
    4: {
      duration: 20,
      backgroundColor: "#A9B8B0",
      description: "Fast enemies, minimal cover",
      enemies: [
        { x: 0.1, y: 0.1, speedX: 6, speedY: 6 },
        { x: 0.9, y: 0.9, speedX: -6, speedY: -6 },
        { x: 0.5, y: 0.5, speedX: 6, speedY: -6 }
      ]
    },
    5: {
      duration: 30,
      backgroundColor: "#A9B8B0",
      description: "Survive the ultimate challenge",
      enemies: [
        { x: 0.1, y: 0.1, speedX: 5, speedY: 5 },
        { x: 0.9, y: 0.1, speedX: -5, speedY: 5 },
        { x: 0.1, y: 0.9, speedX: 5, speedY: -5 },
        { x: 0.9, y: 0.9, speedX: -5, speedY: -5 },
        { x: 0.5, y: 0.5, speedX: 0, speedY: 7 }
      ]
    }
  };

  static getLevel(levelNumber) {
    return this.levels[levelNumber] || this.levels[0];
  }

  static getTotalLevels() {
    return Object.keys(this.levels).length;
  }
}

export default LevelConfig;
