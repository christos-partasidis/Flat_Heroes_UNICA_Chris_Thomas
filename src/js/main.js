import Canvas from './core/Canvas.js';
import Game from './core/Game.js';

window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});