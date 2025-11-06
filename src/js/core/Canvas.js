// Canvas.js
// canvas class - handles all basic canvas operations and setup
class Canvas {
    constructor() {
        // get the canvas element from our HTML
        this.canvas = document.getElementById('gameCanvas');
        
        // get the 2d rendering context - this is what we use to draw
        this.ctx = this.canvas.getContext('2d');
        
        // set initial logical canvas size (important for correct rendering)
        this.setCanvasSize();
        
       // listen for window resize to update canvas size
        window.addEventListener('resize', () => this.setCanvasSize());
    }

    // method to set the logical size of the canvas
    setCanvasSize() {
        // get the actual rendered size of the canvas element
        const width = Math.floor(window.innerWidth);
        // maintain 16:9 aspect ratio
        const height = Math.floor(width * (9/16));
        
        // set canvas logical size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // store dimensions for easy access
        this.width = width;
        this.height = height;
    }

    // method to clear the entire canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

// export the Canvas class to use it in other files
export default Canvas;