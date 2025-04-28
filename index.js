const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const debugDiv = document.getElementById('debug');
        canvas.width = 800;
        canvas.height = 600;

        // ===== GAME STATE =====
        const game = {
            drawing: false,
            points: [],
            spells: {
                circle: { pattern: [], name: "Fireball" },
                triangle: { pattern: [], name: "Lightning" },
                square: { pattern: [], name: "Shield" }
            },
            currentSpell: null
        };

        // Predefine spell patterns (normalized coordinates)
        function createPattern(points) {
            const center = { x: 0, y: 0 };
            points.forEach(p => {
                center.x += p.x;
                center.y += p.y;
            });
            center.x /= points.length;
            center.y /= points.length;

            return points.map(p => ({
                x: p.x - center.x,
                y: p.y - center.y
            }));
        }

        // Sample patterns (simplified)
        game.spells.circle.pattern = createPattern(
            Array.from({ length: 20 }, (_, i) => ({
                x: Math.cos(i * Math.PI / 10) * 50,
                y: Math.sin(i * Math.PI / 10) * 50
            }))
        );

        game.spells.triangle.pattern = createPattern([
            { x: 0, y: -50 }, { x: 50, y: 50 }, { x: -50, y: 50 }
        ]);

        game.spells.square.pattern = createPattern([
            { x: -50, y: -50 }, { x: 50, y: -50 },
            { x: 50, y: 50 }, { x: -50, y: 50 }
        ]);

        // ===== DRAWING LOGIC =====
        canvas.addEventListener('mousedown', (e) => {
            game.drawing = true;
            game.points = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!game.drawing) return;
            game.points.push({ x: e.offsetX, y: e.offsetY });
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.stroke();
        });

        canvas.addEventListener('mouseup', () => {
            game.drawing = false;
            recognizeSpell();
        });

        // ===== SHAPE RECOGNITION ===== (simplified)
        function recognizeSpell() {
            if (game.points.length < 10) return;

            const userPattern = createPattern(game.points);
            let bestMatch = null;
            let lowestError = Infinity;

            // Compare against known spells
            for (const [spellName, spell] of Object.entries(game.spells)) {
                let error = 0;
                const step = Math.max(1, Math.floor(userPattern.length / spell.pattern.length));

                for (let i = 0; i < spell.pattern.length; i++) {
                    const userIdx = Math.min(i * step, userPattern.length - 1);
                    const dx = userPattern[userIdx].x - spell.pattern[i].x;
                    const dy = userPattern[userIdx].y - spell.pattern[i].y;
                    error += Math.sqrt(dx * dx + dy * dy);
                }

                if (error < lowestError) {
                    lowestError = error;
                    bestMatch = spellName;
                }
            }

            // Display result
            if (bestMatch && lowestError < 500) { // Threshold
                game.currentSpell = bestMatch;
                ctx.font = '30px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`CAST: ${game.spells[bestMatch].name}`, 50, 50);
                debugDiv.textContent = `Spell recognized: ${bestMatch} (Error: ${lowestError.toFixed(1)})`;
                
                // Trigger spell effect here
                triggerSpellEffect(bestMatch);
            } else {
                debugDiv.textContent = "Unknown spell!";
            }
        }

        function triggerSpellEffect(spell) {
            // Visual feedback
            ctx.fillStyle = {
                circle: 'rgba(255, 0, 0, 0.3)',
                triangle: 'rgba(0, 255, 255, 0.3)',
                square: 'rgba(0, 255, 0, 0.3)'
            }[spell];

            const center = {
                x: canvas.width/2,
                y: canvas.height/2
            };
            
            // ctx.beginPath();
            // if (spell === 'circle') {
            //     ctx.arc(center.x, center.y, 100, 0, Math.PI*2);
            // } else if (spell === 'triangle') {
            //     ctx.moveTo(center.x, center.y - 100);
            //     ctx.lineTo(center.x + 100, center.y + 100);
            //     ctx.lineTo(center.x - 100, center.y + 100);
            // } else { // square
            //     ctx.rect(center.x - 100, center.y - 100, 200, 200);
            // }
            ctx.fill();
        }