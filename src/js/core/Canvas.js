// Canvas.js
// canvas class - handles all basic canvas operations and setup
class Canvas {
    constructor() {
        // get the canvas element from our HTML
        this.canvas = document.getElementById('gameCanvas');
        
        // get the 2d rendering context - this is what we use to draw
        this.ctx = this.canvas.getContext('2d');
        
        // Resolution scale factor (3 = 3x resolution for very sharp graphics)
        this.scale = 3;
        
        // set initial logical canvas size (important for correct rendering)
        this.setCanvasSize();
        
       // listen for window resize to update canvas size
        window.addEventListener('resize', () => this.setCanvasSize());
    }

    // method to set the logical size of the canvas
    setCanvasSize() {
        // Get the actual rendered size of the canvas container
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = Math.floor(rect.width);
        const displayHeight = Math.floor(rect.height);
        
        // Set canvas internal resolution (scaled up for sharper graphics)
        this.canvas.width = displayWidth * this.scale;
        this.canvas.height = displayHeight * this.scale;
        
        // Scale the context to match
        this.ctx.scale(this.scale, this.scale);
        
        // Store logical dimensions (what you use for game logic)
        this.width = displayWidth;
        this.height = displayHeight;
    }

    // method to clear the entire canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

// export the Canvas class to use it in other files
export default Canvas;