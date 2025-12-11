// Vector.js
// utils/Vector.js
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Create a random unit vector (length 1) pointing in any 360-degree direction
  static randomDirection() {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  // Scale the vector (multiply length by n)
  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  // Add another vector to this one
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
}

export default Vector;

