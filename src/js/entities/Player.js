// Player.js
import Collision from '../physics/Collision.js';

class Player {
    constructor(canvas) {
        // store canvas reference for boundary checking
        this.canvas = canvas;
        
        // player size (square)
        this.size = 30;

        // center the player on screen
        this.x = canvas.width / 2 - this.size / 2;  // center horizontally
        this.y = canvas.height / 2 - this.size / 2; // center vertically
        
        // player color
        this.color = '#FF7711';

        this.speed = 8;
        
        // physics properties
        this.velocityY = 0;
        this.gravity = 0.5;
        this.onGround = false;
        this.jumpPower = -12;
        this.maxJumps = 2;  // Allow double jump
        this.jumpsRemaining = this.maxJumps;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    // add update method for movement
    update(input, walls) {
        // horizontal movement only
        if (input.keys.ArrowLeft) {
            this.x -= this.speed;
        }
        if (input.keys.ArrowRight) {
            this.x += this.speed;
        }
        
        // Jump with space key (allows double jump) - only on key press, not hold
        if (input.keysJustPressed[' ']) {
            console.log('Space just pressed. Jumps remaining:', this.jumpsRemaining, 'On ground:', this.onGround);
            
            if (this.jumpsRemaining > 0) {
                console.log('Jump executed! Jumps remaining before:', this.jumpsRemaining);
                this.velocityY = this.jumpPower;
                this.jumpsRemaining--;
                this.onGround = false;
                console.log('Jumps remaining after:', this.jumpsRemaining);
            }
        }
        
        // apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // reset ground state
        this.onGround = false;

        // check wall collisions and constrain position
        walls.forEach((wall) => {
            if (Collision.checkRectCollision(
                { x: this.x, y: this.y, width: this.size, height: this.size },
                wall
            )) {
                // Top wall collision
                if (wall.y === 0 && wall.height < wall.width) {
                    this.y = wall.height;
                    this.velocityY = 0;
                }
                // Bottom wall collision
                else if (wall.y > this.canvas.height / 2 && wall.height < wall.width) {
                    this.y = wall.y - this.size;
                    this.velocityY = 0;
                    this.onGround = true;
                    console.log('Landed on ground! Resetting jumps to:', this.maxJumps);
                    this.jumpsRemaining = this.maxJumps;  // Reset jumps when on ground
                }
                // Left wall collision
                else if (wall.x === 0 && wall.width < wall.height) {
                    this.x = wall.width;
                }
                // Right wall collision
                else if (wall.x > this.canvas.width / 2 && wall.width < wall.height) {
                    this.x = wall.x - this.size;
                }
            }
        });
    }

}

export default Player;