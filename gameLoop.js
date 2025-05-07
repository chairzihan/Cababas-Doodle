// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
const game = {
    player: { x: 100, y: canvas.height/2, width: 50, height: 50 },
    enemies: [],
    lastSpawnTime: 0,
    spawnInterval: 5000,
    difficulty: 1,
    health: 100,
    score: 0,
    drawing: false,
    points: [],
    directions: [],
    isPaused: false,
    gameOver: false,
    winScore: 300 
};

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.player.y = canvas.height/2;
});

// Enemy class
class Enemy {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width;
        this.y = 100 + Math.random() * (canvas.height - 200);
        this.speed = 2 * game.difficulty;
        this.sequence = this.generateSequence();
        this.currentStep = 0;
    }
    
    generateSequence() {
        const directions = ['up', 'down', 'left', 'right'];
        // Longer sequences as difficulty increases
        const length = Math.min(5, 2 + Math.floor(game.difficulty / 2));
        return Array.from({length}, () => 
            directions[Math.floor(Math.random() * directions.length)]
        );
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw(ctx) {
        // Enemy box
        ctx.fillStyle = '#ff5555';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Sequence indicators
        this.sequence.forEach((dir, i) => {
            ctx.fillStyle = i < this.currentStep ? '#00ff00' : '#ffffff';
            ctx.fillRect(
                this.x - this.width/2 + i * 20, 
                this.y - this.height/2 - 30, 
                15, 
                15
            );
            
            // Direction text
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.fillText(dir[0].toUpperCase(), 
                this.x - this.width/2 + i * 20 + 3, 
                this.y - this.height/2 - 20);
        });
    }
    
    checkInput(direction) {
        if (this.sequence[this.currentStep] === direction) {
            this.currentStep++;
            if (this.currentStep >= this.sequence.length) {
                return true; // Defeated
            }
        }
        return false;
    }
}

// Input handling
canvas.addEventListener('mousedown', (e) => {
    game.drawing = true;
    game.points = [{x: e.clientX, y: e.clientY}];
    game.directions = [];
});

canvas.addEventListener('mousemove', (e) => {
    if (!game.drawing) return;
    
    const lastPoint = game.points[game.points.length-1];
    const newPoint = {x: e.clientX, y: e.clientY};
    game.points.push(newPoint);
    
    // Detect direction
    const dx = newPoint.x - lastPoint.x;
    const dy = newPoint.y - lastPoint.y;
    
    if (Math.abs(dx) + Math.abs(dy) > 10) { // Minimum movement
        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
        } else {
            direction = dy > 0 ? 'down' : 'up';
        }
        
        if (direction !== game.directions[game.directions.length-1]) {
            game.directions.push(direction);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (!game.drawing) return;
    game.drawing = false;
    
    if (game.directions.length > 0) {
        castSpell(game.directions[0]); // Use first direction for simplicity
    }
    
    game.points = [];
    game.directions = [];
});

function castSpell(direction) {
    document.getElementById('spell-feedback').textContent = `Casting: ${direction}`;
    
    for (let i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].checkInput(direction)) {
            if (game.enemies[i].currentStep >= game.enemies[i].sequence.length) {
                game.score += 10;
                game.enemies.splice(i, 1);
                document.getElementById('score').textContent = game.score;
                document.getElementById('spell-feedback').textContent = `Defeated with ${direction}!`;
                return;
            }
        }
    }
}

// Game loop
function gameLoop(timestamp) {
    if (game.isPaused || game.gameOver || checkWinCondition()) {
        return; 
    }
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn enemies
    if (timestamp - game.lastSpawnTime > game.spawnInterval) {
        game.enemies.push(new Enemy());
        game.lastSpawnTime = timestamp;
        game.spawnInterval = Math.max(500, game.spawnInterval * 0.95);
        game.difficulty += 0.1;
    }
    
    // Update enemies
    game.enemies.forEach(enemy => {
        enemy.update();
        
        // Check collision with player
        if (enemy.x - enemy.width/2 < game.player.x + game.player.width/2) {
            game.health -= 10;
            document.getElementById('health').textContent = game.health;
            game.enemies = game.enemies.filter(e => e !== enemy);
            
            if (game.health <= 0) {
                document.getElementById('spell-feedback').textContent = "GAME OVER";

                return;
            }
        }
    });
    
    // Draw player
    ctx.fillStyle = '#ff9900';
    ctx.fillRect(
        game.player.x - game.player.width/2, 
        game.player.y - game.player.height/2, 
        game.player.width, 
        game.player.height
    );
    
    // Draw enemies
    game.enemies.forEach(enemy => enemy.draw(ctx));
    
    // Draw current drawing path
    if (game.drawing && game.points.length > 1) {
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(game.points[0].x, game.points[0].y);
        for (let i = 1; i < game.points.length; i++) {
            ctx.lineTo(game.points[i].x, game.points[i].y);
        }
        ctx.stroke();
    }
    
    requestAnimationFrame(gameLoop);
}

    function togglePause() {
        game.isPaused = !game.isPaused;
        document.getElementById('pause-screen').style.display = game.isPaused ? 'flex' : 'none';
        if (!game.isPaused) {
            requestAnimationFrame(gameLoop); // Restart loop if unpausing
        }
    }


function resumeGame() {
    document.getElementById('pause-screen').style.display = 'none';s
    game.isPaused = false;
   
}

function restartGame() {
    // Reset game state
    game.enemies = [];
    game.score = 0;
    game.health = 100;
    game.difficulty = 1;
    game.isPaused = false;
    game.gameOver = false;
    
    // Update UI
    document.getElementById('health').textContent = game.health;
    document.getElementById('score').textContent = game.score;
    document.getElementById('win-screen').style.display = 'none';
    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('spell-feedback').textContent = "Draw to cast spells!";
    
    // Restart the game loopen  
    requestAnimationFrame(gameLoop);
}

function checkWinCondition() {
    if (game.score >= game.winScore) {
        document.getElementById('final-score').textContent = game.score;
        document.getElementById('win-screen').style.display = 'flex';
        return true;
    }
    return false;
}



// Add pause key (ESC)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
});

// Start game
requestAnimationFrame(gameLoop);

document.getElementById('resume-button').addEventListener('click', togglePause);
document.getElementById('restart-button').addEventListener('click', restartGame);