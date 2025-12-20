// LevelConfig.js - Contains configuration for all game levels
class LevelConfig {
  static getLevel1Enemies() {
    const enemies = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: (i + 0.5) / count, // Distribute evenly across width
        y: 0.05, // Start near top
        speedX: 0,
        speedY: 6, // Move down
        width: 7,
        height: 30,
        destroyOnWall: true,
        delay: i * 10, // Domino effect delay
      });
    }
    return enemies;
  }

  static getLevel2Enemies() {
    const enemies = [];
    const count = 40; // Total pairs
    const startDelay = 60;

    for (let i = 0; i < count; i++) {
      // Top enemy (Moves Down)
      enemies.push({
        x: (i + 0.5) / count,
        y: 0.05,
        speedX: 0,
        speedY: 6,
        width: 7,
        height: 30,
        destroyOnWall: true,
        delay: startDelay + i * 2,
      });

      // Bottom enemy (Moves Up)
      enemies.push({
        x: (i + 0.5) / count,
        y: 0.9,
        speedX: 0,
        speedY: -6,
        width: 7,
        height: 30,
        destroyOnWall: true,
        delay: startDelay + i * 10,
      });
    }
    return enemies;
  }

  static levels = {
    1: {
      duration: 13,
      backgroundColor: "#A9B8B0",
      description: "Rain of arrows",
      get enemies() {
        return LevelConfig.getLevel1Enemies();
      },
      walls: (w, h, t) => [
        { x: t, y: h * 0.5, width: w * 0.75, height: t, color: "#028368" },
      ],
    },
    2: {
      duration: 12,
      backgroundColor: "#A9B8B0",
      description: "Multiple enemies appear",
      get enemies() {
        return LevelConfig.getLevel2Enemies();
      },
      walls: (w, h, t) => [
        { x: t, y: h * 0.5, width: w * 0.33, height: t, color: "#028368" },
        {
          x: w * 0.67,
          y: h * 0.5,
          width: w * 0.33 - t,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.4,
          y: h * 0.25,
          width: w * 0.6 - t,
          height: t,
          color: "#028368",
        },
      ],
    },
    3: {
      duration: 25,
      backgroundColor: "#A9B8B0",
      description: "Navigate through obstacles",
      enemies: [
        { x: 0.1, y: 0.1, speedX: 5, speedY: 5 },
        { x: 0.9, y: 0.1, speedX: -5, speedY: 5 },
        { x: 0.1, y: 0.9, speedX: 5, speedY: -5 },
        { x: 0.9, y: 0.9, speedX: -5, speedY: -5 },
        { x: 0.5, y: 0.5, speedX: 0, speedY: 7 },
      ],
      walls: (w, h, t) => [],
    },
    4: {
      duration: 20,
      backgroundColor: "#A9B8B0",
      description: "Fast enemies, minimal cover",
      get enemies() {
        return LevelConfig.getLevel1Enemies();
      },
      walls: (w, h, t) => [
        {
          x: w * 0.625,
          y: h * 0.9,
          width: w * 0.25,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.125,
          y: h * 0.7,
          width: w * 0.25,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.625,
          y: h * 0.5,
          width: w * 0.25,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.125,
          y: h * 0.3,
          width: w * 0.25,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.85,
          y: h * 0.15,
          width: t,
          height: h * 0.15,
          color: "#028368",
        },
        {
          x: w * 0.7,
          y: h * 0.3,
          width: w * 0.15 + t,
          height: t,
          color: "#028368",
        },
      ],
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
        { x: 0.5, y: 0.5, speedX: 0, speedY: 7 },
      ],
      walls: (w, h, t) => [
        {
          x: w * 0.2,
          y: h * 0.15,
          width: w * 0.75,
          height: t,
          color: "#028368",
        },
        { x: w * 0.2, y: h * 0.5, width: w * 0.6, height: t, color: "#028368" },
        {
          x: w * 0.05,
          y: h * 0.85,
          width: w * 0.75,
          height: t,
          color: "#028368",
        },
        {
          x: w * 0.1,
          y: h * 0.15,
          width: t,
          height: h * 0.25,
          color: "#028368",
        },
        {
          x: w * 0.9,
          y: h * 0.55,
          width: t,
          height: h * 0.25,
          color: "#028368",
        },
      ],
    },
  };

  static getLevel(levelNumber) {
    return this.levels[levelNumber] || this.levels[0];
  }

  static getTotalLevels() {
    return Object.keys(this.levels).length;
  }
}

export default LevelConfig;
