// Enemy.js
import Collision from "../physics/Collision.js";

class Enemy {
  constructor(x, y, canvas, width = 20, height = 15, destroyOnWall = false) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;
    this.destroyOnWall = destroyOnWall;
    this.isDead = false;

    this.color = "#FF0000";
    this.speedX = 4;
    this.speedY = 4;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    // FIX: Use width/height here too
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(walls) {
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
          // We are now moving up, so we must have hit the floor
          // Snap to top of wall
          // CRITICAL FIX: Use this.height, not this.size
          this.y = wall.y - this.height;
        } else {
          // We are now moving down, so we must have hit the ceiling
          // Snap to bottom of wall
          this.y = wall.y + wall.height;
        }
      }
    }
  }
}

export default Enemy;
