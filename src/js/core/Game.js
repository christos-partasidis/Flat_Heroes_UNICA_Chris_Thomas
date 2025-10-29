// Game.js
import Canvas from './Canvas.js';

class Game {
    constructor() {
        // initialize canvas
        this.canvas = new Canvas();
        // track if game is running
        this.isRunning = false;
        // store last frame timestamp
        this.lastTime = 0;
    }

    // start the game loop
    start() {
        this.isRunning = true;
        // start first frame
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    // main game loop
    gameLoop(timestamp) {
        // calculate time between frames
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // clear previous frame
        this.canvas.clear();

        // draw test rectangle
        this.canvas.ctx.fillStyle = 'red';
        this.canvas.ctx.fillRect(50, 50, 100, 100);

        // continue loop if game is running
        if (this.isRunning) {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
}

export default Game;