// Player.js
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
    update(input) {
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

        // keep player within canvas bounds
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.size));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.size));
    }

}

export default Player;