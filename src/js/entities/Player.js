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
        this.color = '#FF0000';

        this.speed = 5;
        
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    // add update method for movement
    update(input, walls) {
        // store previous position
        const prevX = this.x;
        const prevY = this.y;

        // horizontal movement
        if (input.keys.ArrowLeft) {
            this.x -= this.speed;
        }
        if (input.keys.ArrowRight) {
            this.x += this.speed;
        }
        
        // vertical movement
        if (input.keys.ArrowUp) {
            this.y -= this.speed;
        }
        if (input.keys.ArrowDown) {
            this.y += this.speed;
        }

        // check wall collisions and constrain position
        walls.forEach((wall) => {
            if (Collision.checkRectCollision(
                { x: this.x, y: this.y, width: this.size, height: this.size },
                wall
            )) {
                // Top wall collision
                if (wall.y === 0 && wall.height < wall.width) {
                    this.y = wall.height;
                }
                // Bottom wall collision
                else if (wall.y > this.canvas.height / 2 && wall.height < wall.width) {
                    this.y = wall.y - this.size;
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