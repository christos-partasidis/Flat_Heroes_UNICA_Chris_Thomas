import Canvas from './core/Canvas.js';

// create canvas instance when page loads
window.addEventListener('load', () => {
    const canvas = new Canvas();
    
    // draw a test rectangle to verify canvas works
    const ctx = canvas.ctx;
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 100, 100);
});