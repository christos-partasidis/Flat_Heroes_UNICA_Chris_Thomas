// entities/Enemy.js
import Collision from "../physics/Collision.js";
import Vector from "../physics/Vector.js";

class Enemy {
  constructor(x, y, canvas, config = {}) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;

    this.width = config.width || 30;
    this.height = config.height || 30;
    this.destroyOnWall = config.destroyOnWall || false;
    this.delay = config.delay || 0;

    this.color = "#FF0000";
    this.isDead = false;

    if (config.speedX !== undefined && config.speedY !== undefined) {
      this.speedX = config.speedX;
      this.speedY = config.speedY;
    } else {
      // 1. Get a truly random 360-degree direction
      const direction = Vector.randomDirection();

      // 2. Set base speed with small random variance (e.g., 3.5 to 4.5)
      const speedMag = 4 + (Math.random() - 0.5);

      // 3. Calculate velocity vector
      const velocity = direction.mult(speedMag);
      this.speedX = velocity.x;
      this.speedY = velocity.y;
    }
  }

  draw(ctx) {
    if (this.delay > 0) return;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(walls) {
    if (this.delay > 0) {
      this.delay--;
      return;
    }

    // --- HORIZONTAL MOVEMENT ---
    this.x += this.speedX;

    for (const wall of walls) {
      if (Collision.checkRectCollision(this, wall)) {
        if (this.destroyOnWall) {
          this.isDead = true;
          return;
        }

        this.speedX = -this.speedX;

        // FIX: If speed is now negative (moving left), we hit the right side of a wall
        if (this.speedX < 0) {
          // Snap to left side of wall
          // CRITICAL FIX: Use this.width, not this.size
          this.x = wall.x - this.width;
        } else {
          // Snap to right side of wall
          this.x = wall.x + wall.width;
        }
      }
    }

    // --- VERTICAL MOVEMENT ---
    this.y += this.speedY;

    for (const wall of walls) {
      if (Collision.checkRectCollision(this, wall)) {
        if (this.destroyOnWall) {
          this.isDead = true;
          return;
        }

        this.speedY = -this.speedY;

        if (this.speedY < 0) {
          this.y = wall.y - this.height;
        } else {
          this.y = wall.y + wall.height;
        }
      }
    }
  }
}

export default Enemy;
