// InputHandler.js
class InputHandler {
  constructor() {
    // track pressed keys
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
      " ": false, // Space key
      w: false,
      a: false,
      s: false,
      d: false,
      Shift: false,
    };

    // track keys that were just pressed this frame
    this.keysJustPressed = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
      " ": false,
      w: false,
      a: false,
      s: false,
      d: false,
      Shift: false,
    };

    // add event listeners
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if (this.keys.hasOwnProperty(e.key)) {
      // Only set justPressed if key wasn't already down
      if (!this.keys[e.key]) {
        this.keysJustPressed[e.key] = true;
      }
      this.keys[e.key] = true;
    }
  }

  handleKeyUp(e) {
    if (this.keys.hasOwnProperty(e.key)) {
      this.keys[e.key] = false;
      this.keysJustPressed[e.key] = false;
    }
  }

  // Call this at the end of each frame to reset justPressed states
  update() {
    Object.keys(this.keysJustPressed).forEach((key) => {
      this.keysJustPressed[key] = false;
    });
  }
}

export default InputHandler;

