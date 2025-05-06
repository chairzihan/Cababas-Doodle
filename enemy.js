// Enemy class with sequence-based weaknesses
class Enemy {
    constructor() {
      this.x = 1200; // Start at right edge
      this.y = 100 + Math.random() * 400;
      this.speed = 1 + Math.random() * 2;
      this.size = 40;
      this.sequence = this.generateSequence();
      this.currentStep = 0;
      this.color = this.getColor();
    }
  
    generateSequence() {
      const directions = ['up', 'down', 'left', 'right'];
      return [directions[Math.floor(Math.random() * 4)]]; // Single direction for now
    }
  
    getColor() {
      const colors = {
        'up': '#ff5555', 
        'down': '#55ffff',
        'left': '#ffaa00',
        'right': '#aa55ff'
      };
      return colors[this.sequence[0]];
    }
  
    update() {
      this.x -= this.speed;
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
  
      // Draw direction indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(this.sequence[0], this.x - 10, this.y - 20);
    }
  
    checkSpell(direction) {
      if (this.sequence[this.currentStep] === direction) {
        return true; // Enemy defeated
      }
      return false;
    }
  }
  
  // Enemy Manager
  class EnemyManager {
    constructor() {
      this.enemies = [];
      this.spawnTimer = 0;
      this.spawnInterval = 2000;
    }
  
    update(deltaTime) {
      this.spawnTimer += deltaTime;
      if (this.spawnTimer > this.spawnInterval) {
        this.enemies.push(new Enemy());
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(500, this.spawnInterval * 0.98);
      }
  
      this.enemies.forEach(enemy => enemy.update());
      this.enemies = this.enemies.filter(enemy => enemy.x + enemy.size > 0);
    }
  
    draw(ctx) {
      this.enemies.forEach(enemy => enemy.draw(ctx));
    }
  
    checkHit(direction) {
      let hit = false;
      this.enemies = this.enemies.filter(enemy => {
        if (enemy.checkSpell(direction)) {
          hit = true;
          return false;
        }
        return true;
      });
      return hit;
    }
  }
  
  export const enemyManager = new EnemyManager();