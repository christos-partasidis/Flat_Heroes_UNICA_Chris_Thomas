// entities/Enemy.js
import Collision from "../physics/Collision.js";
import Vector from "../physics/Vector.js";

class Enemy {
  constructor(x, y, canvas) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;

    this.width = 30;
    this.height = 30;

    this.color = "#FF0000";

    // 1. Get a truly random 360-degree direction
    const direction = Vector.randomDirection();

    // 2. Set base speed with small random variance (e.g., 3.5 to 4.5)
    const speedMag = 4 + (Math.random() - 0.5);

    // 3. Calculate velocity vector
    this.velocity = direction.mult(speedMag);
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(walls) {
    // --- HORIZONTAL MOVEMENT ---
    this.x += this.velocity.x;

    for (const wall of walls) {
      if (Collision.checkRectCollision(this, wall)) {
        this.velocity.x = -this.velocity.x;

        if (this.velocity.x < 0) {
          this.x = wall.x - this.width;
        } else {
          this.x = wall.x + wall.width;
        }
      }
    }

    // --- VERTICAL MOVEMENT ---
    this.y += this.velocity.y;

    for (const wall of walls) {
      if (Collision.checkRectCollision(this, wall)) {
        this.velocity.y = -this.velocity.y;

        if (this.velocity.y < 0) {
          this.y = wall.y - this.height;
        } else {
          this.y = wall.y + wall.height;
        }
      }
    }
  }
}

export default Enemy;
