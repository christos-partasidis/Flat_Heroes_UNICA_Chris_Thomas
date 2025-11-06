// Collision.js
class Collision {
    // Check if two rectangles are colliding (AABB collision)
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Check collision and return which walls are colliding
    static checkWallCollisions(player, walls) {
        const playerRect = {
            x: player.x,
            y: player.y,
            width: player.size,
            height: player.size
        };

        const collisions = {
            top: false,
            bottom: false,
            left: false,
            right: false
        };

        walls.forEach((wall, index) => {
            if (this.checkRectCollision(playerRect, wall)) {
                // Determine which wall based on index (0=top, 1=bottom, 2=left, 3=right)
                switch(index) {
                    case 0: collisions.top = true; break;
                    case 1: collisions.bottom = true; break;
                    case 2: collisions.left = true; break;
                    case 3: collisions.right = true; break;
                }
            }
        });

        return collisions;
    }
}

export default Collision;