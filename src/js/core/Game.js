// Game.js
import Canvas from './Canvas.js';
import Player from '../entities/Player.js';
import InputHandler from './InputHandler.js';
import Wall from '../entities/Wall.js';

class Game {
    constructor() {
        // initialize canvas
        this.canvas = new Canvas();
        // track if game is running
        this.isRunning = false;
        // store last frame timestamp
        this.lastTime = 0;

        // create player instance
        this.player = new Player(this.canvas);

        // add input handler
        this.input = new InputHandler();
        
        // create walls
        this.walls = this.createWalls();
        
        // log input state for testing
        console.log('Input handler initialized');
    }

    // create the four walls around the canvas
    createWalls() {
        const wallThickness = 15;
        
        return [
            // Top wall - Orange
            new Wall(0, 0, this.canvas.width, wallThickness, '#FF7711'),
            
            // Bottom wall - Green
            new Wall(0, this.canvas.height - wallThickness, this.canvas.width, wallThickness, '#028368'),
            
            // Left wall - Blue
            new Wall(0, 0, wallThickness, this.canvas.height, '#003C57'),
            
            // Right wall - Yellow
            new Wall(this.canvas.width - wallThickness, 0, wallThickness, this.canvas.height, '#CEEE00')
        ];
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

        // draw walls
        this.walls.forEach(wall => wall.draw(this.canvas.ctx));

        // update player with input
        this.player.update(this.input);
        this.player.draw(this.canvas.ctx);
        
        // continue loop if game is running
        if (this.isRunning) {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
}

export default Game;