const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const resultDiv = document.getElementById('result');
        canvas.width = 1200;
        canvas.height = 600;

        // Game state
        const game = {
            drawing: false,
            points: [],
            directions: [],
            lastDirection: null
        }; 

        // Direction constants
        const DIRECTION = {
            UP: 'up',
            DOWN: 'down',
            LEFT: 'left',
            RIGHT: 'right'
        };

        // Drawing handlers
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseleave', endDrawing);

        function startDrawing(e) {
            game.drawing = true;
            game.points = [{ x: e.offsetX, y: e.offsetY }];
            game.directions = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            resultDiv.textContent = "Casting...";
        }

        function draw(e) {
            if (!game.drawing) return;
            
            const lastPoint = game.points[game.points.length-1];
            const newPoint = { x: e.offsetX, y: e.offsetY };
            
            // Only store point if moved significantly
            if (distance(lastPoint, newPoint) > 5) {
                game.points.push(newPoint);
                detectDirection(lastPoint, newPoint);
                ctx.lineTo(newPoint.x, newPoint.y);
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        function endDrawing() {
            if (!game.drawing) return;
            game.drawing = false;
            
            setTimeout(() => {
                recognizeShape();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 100);
        }

        // Detect direction between two points
        function detectDirection(start, end) {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            
            // Only consider significant movements
            if (Math.abs(dx) + Math.abs(dy) < 10) return;
            
            let direction;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
            } else {
                direction = dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
            }
            
            // Only add if direction changed NEEDS TO BE FIXED
            if (direction !== game.lastDirection) {
                game.directions.push(direction);
                game.lastDirection = direction;
            }
        }

        // Recognize shapes based on direction sequence
        function recognizeShape() {
            console.log("Directions:", game.directions); // Debug
            
            if (game.directions.length === 0) {
                resultDiv.textContent = "No drawing detected";
                return;
            }
            
            // Simple line recognition
            if (game.directions.length === 1) {
                resultDiv.textContent = `Line to ${game.directions[0]}`;
                return;
            }
            
            // Shape recognition
            const dirString = game.directions.join(',');
            
            if (dirString.includes('right,down,left,up') || 
                dirString.includes('down,left,up,right') ||
                dirString.includes('left,up,right,down') ||
                dirString.includes('up,right,down,left')) {
                resultDiv.textContent = "Rectangle detected!";
            } 
            else if (dirString.includes('right,down,left') || 
                     dirString.includes('down,left,up') ||
                     dirString.includes('left,up,right') ||
                     dirString.includes('up,right,down')) {
                resultDiv.textContent = "Triangle detected!";
            }
            else {
                resultDiv.textContent = "Path: " + game.directions.join(' → ');
            }
        }

 
        function distance(a, b) {
            return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }