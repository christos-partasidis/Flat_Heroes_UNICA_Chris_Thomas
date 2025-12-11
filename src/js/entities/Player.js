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
    if (this.isDashing) {
      // --- DASHING PHYSICS ---
      this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
      // Move with collision checking to avoid tunneling through walls
      const maxStep = 1; // pixels per sub-step (must be small to catch walls)
      let remaining = Math.abs(this.dashVelocity);
      const direction = Math.sign(this.dashVelocity);
      
      // Move step by step and check collisions
      while (remaining > 0 && this.isDashing) {
        const step = Math.min(remaining, maxStep);
        const oldX = this.x;
        this.x += direction * step;
        
        // Clamp to canvas bounds immediately
        const leftWall = walls.find((w) => w.x === 0 && w.width < 50);
        const rightWall = walls.find((w) => w.x + w.width === this.canvas.width && w.width < 50);
        const leftLimit = leftWall ? leftWall.width : 0;
        const rightLimit = rightWall ? rightWall.x - this.width : this.canvas.width - this.width;
        
        if (this.x < leftLimit || this.x > rightLimit) {
          this.x = this.x < leftLimit ? leftLimit : rightLimit;
          this.isDashing = false;
          this.dashVelocity = 0;
          this.collisions.left = this.x <= leftLimit;
          this.collisions.right = this.x >= rightLimit;
          break;
        }
        
        // Check collision with all walls
        let hitWall = false;
        const playerRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        
        for (const wall of walls) {
          if (Collision.checkRectCollision(playerRect, wall)) {
            // Calculate overlap on each side
            const overlapLeft = this.x + this.width - wall.x;
            const overlapRight = wall.x + wall.width - this.x;
            
            // Only treat as blocking if it's a side collision during horizontal movement
            if (overlapLeft < overlapRight && direction > 0) {
              // Hit left side of wall while moving right
              this.x = wall.x - this.width;
              this.collisions.right = true;
              hitWall = true;
            } else if (overlapRight < overlapLeft && direction < 0) {
              // Hit right side of wall while moving left
              this.x = wall.x + wall.width;
              this.collisions.left = true;
              hitWall = true;
            }
            
            if (hitWall) {
              this.isDashing = false;
              this.dashVelocity = 0;
              break;
            }
          }
        }
        
        if (hitWall) break;
        remaining -= step;
      }

      this.velocityY = 0; // No gravity while dashing!

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
      this.velocityY += this.gravity;
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

