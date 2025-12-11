// Player.js
import Collision from "../physics/Collision.js";
import SoundManager from "../core/SoundManager.js";

class Player {
  constructor(canvas) {
    // I need the canvas to know how big the screen is!
    this.canvas = canvas;

    // Size of the player square (kept consistent across logic)
    this.width = 30;
    this.height = 30;

    // Start in the middle-ish
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height * 0.25 - this.height / 2;

    // Colors and speed
    this.color = "#FF7711";
    this.speed = 8;

    // --- DASH STUFF ---
    this.canDash = true;
    this.isDashing = false;
    this.dashSpeed = 20;
    this.dashDuration = 10;
    this.dashTimer = 0;
    this.dashCooldown = 60;
    this.dashCooldownTimer = 0;

    // Trail for visual effect so it looks fast
    this.trail = [];

    // Physics stuff
    this.velocityY = 0;
    this.gravity = 0.5;
    this.onGround = false;
    this.jumpPower = -16;
    this.maxJumps = 2;
    this.jumpsRemaining = this.maxJumps;

    // Keeps track of what we are touching (for debug panel)
    this.collisions = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
  }

  draw(ctx) {
    // FIRST: Draw the trail behind the player
    // I loop through the trail array and draw fading squares
    this.trail.forEach((pos) => {
      // Debug: Solid Red, no alpha
      ctx.fillStyle = "red";
      ctx.globalAlpha = 1.0;
      ctx.fillRect(pos.x, pos.y, this.width, this.height);

      // Decrease life logic for testing
      pos.life--;
    });

    // Filter by life instead of alpha
    this.trail = this.trail.filter((pos) => pos.life > 0);

    ctx.globalAlpha = 1.0; // Reset opacity so player is solid

    // Flash white if dashing, otherwise normal color
    ctx.fillStyle = this.isDashing ? "#FFFFFF" : this.color;
    //ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(input, walls) {
    // 1. MANAGE TIMERS
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer--;
    }

    // Reset collision flags for this frame
    // If I don't do this, it remembers old collisions
    this.onGround = false;
    this.collisions = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };

    // 2. CHECK FOR DASH INPUT
    // Check if Shift is pressed AND we are allowed to dash
    if (
      input.keysJustPressed["Shift"] &&
      this.dashCooldownTimer === 0 &&
      !this.isDashing
    ) {
      // Start the dash!
      SoundManager.play("dash");
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
      this.dashCooldownTimer = this.dashCooldown;

      // Decide which way to dash
      // If pressing Left or A, go left (-speed)
      // If pressing Right or D, go right (+speed)
      // Otherwise default to right
      this.dashVelocity = 0;
      if (input.keys.ArrowLeft || input.keys.a)
        this.dashVelocity = -this.dashSpeed;
      else if (input.keys.ArrowRight || input.keys.d)
        this.dashVelocity = this.dashSpeed;
      else this.dashVelocity = this.dashSpeed;
    }

    // 3. MOVE THE PLAYER
    // 3. MOVE THE PLAYER
    if (this.isDashing) {
      // --- DASHING PHYSICS ---
      this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });

      // 1. Calculate where we WANT to go
      const nextX = this.x + this.dashVelocity;

      // 2. Create a rectangle for that future position
      const nextRect = {
        x: nextX,
        y: this.y,
        width: this.size,
        height: this.size,
      };

      // 3. Check if that future position hits ANY wall
      let hitWall = false;
      for (const wall of walls) {
        if (Collision.checkRectCollision(nextRect, wall)) {
          hitWall = true;
          // We hit a wall! Stop dashing immediately and snap to the wall edge.
          if (this.dashVelocity > 0) {
            // Moving right -> hit left side of wall
            this.x = wall.x - this.size;
          } else if (this.dashVelocity < 0) {
            // Moving left -> hit right side of wall
            this.x = wall.x + wall.width;
          }

          // Cancel the dash
          this.isDashing = false;
          this.dashVelocity = 0;
          break;
        }
      }

      // 4. If we didn't hit a wall, move normally
      if (!hitWall) {
        this.x = nextX;
        this.velocityY = 0; // No gravity while dashing!
      }

      // Count down dash duration
      this.dashTimer--;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocityY = 0; // Stop floating when dash ends
      }
    } else {
      // --- NORMAL PHYSICS ---

      // Horizontal Movement (Arrows or WASD)
      if (input.keys.ArrowLeft || input.keys.a) {
        this.x -= this.speed;
      }
      if (input.keys.ArrowRight || input.keys.d) {
        this.x += this.speed;
      }

      // Jump (Space OR W OR ArrowUp)
      // Use keysJustPressed so holding it doesn't make you fly
      if (
        input.keysJustPressed[" "] ||
        input.keysJustPressed["w"] ||
        input.keysJustPressed["ArrowUp"]
      ) {
        // Check if we have jumps left
        if (this.jumpsRemaining > 0) {
          this.velocityY = this.jumpPower;
          this.jumpsRemaining--;
          this.onGround = false;
          SoundManager.play("jump");
        }
      }

      // Apply Gravity
      // Apply Gravity
      this.velocityY += this.gravity;

      if (this.velocityY > 14) {
        this.velocityY = 14;
      }

      this.y += this.velocityY;
    }

    // 4. CHECK WALL COLLISIONS
    // Loop through every wall to see if we hit it
    walls.forEach((wall) => {
      if (
        Collision.checkRectCollision(
          { x: this.x, y: this.y, width: this.width, height: this.height },
          wall,
        )
      ) {
        // We need to know which side we hit.
        // A simple way is to calculate the overlap on each side
        // and choose the smallest overlap as the collision side.

        // Calculate how far we are inside the wall on each side
        const overlapLeft = this.x + this.width - wall.x;
        const overlapRight = wall.x + wall.width - this.x;
        const overlapTop = this.y + this.height - wall.y;
        const overlapBottom = wall.y + wall.height - this.y;

        // Find the smallest overlap
        const minOverlap = Math.min(
          overlapLeft,
          overlapRight,
          overlapTop,
          overlapBottom,
        );

        if (minOverlap === overlapTop) {
          // HIT TOP of wall (It's a floor!)
          // Only count as floor if we are falling down (velocityY >= 0)
          if (this.velocityY >= 0) {
            this.y = wall.y - this.height;
            this.velocityY = 0;
            this.onGround = true;
            this.collisions.bottom = true;
            this.jumpsRemaining = this.maxJumps;
          }
        } else if (minOverlap === overlapBottom) {
          // HIT BOTTOM of wall (Ceiling)
          this.y = wall.y + wall.height;
          this.velocityY = 0;
          this.collisions.top = true;
        } else if (minOverlap === overlapLeft) {
          // HIT LEFT side of wall
          this.x = wall.x - this.width;
          this.collisions.right = true;
        } else if (minOverlap === overlapRight) {
          // HIT RIGHT side of wall
          this.x = wall.x + wall.width;
          this.collisions.left = true;
        }
      }
    });
  }
}

export default Player;
