import store from '../../vuex/store';

// Web Audio API Sound Effects Synthesizer (No external asset files needed)
class SoundFx {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playEat() {
        if (!store.getters.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playTurn() {
        if (!store.getters.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(280, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    playGameOver() {
        if (!store.getters.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    playWin() {
        if (!store.getters.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }
}

export const sfx = new SoundFx();

class Part {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Snake {
    constructor(game, x, y, segments) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.xspeed = 1;
        this.yspeed = 0;
        this.inputQueue = [];
        this.parts = [];

        for (let i = 0; i < segments; i++) {
            this.parts.push(new Part(x - i, y));
        }
    }

    controller(key) {
        let newXSpeed = null;
        let newYSpeed = null;

        // Keycodes: 37/65 (Left), 38/87 (Up), 39/68 (Right), 40/83 (Down)
        if (key === 37 || key === 65) {
            newXSpeed = -1;
            newYSpeed = 0;
        } else if (key === 39 || key === 68) {
            newXSpeed = 1;
            newYSpeed = 0;
        } else if (key === 38 || key === 87) {
            newXSpeed = 0;
            newYSpeed = -1;
        } else if (key === 40 || key === 83) {
            newXSpeed = 0;
            newYSpeed = 1;
        }

        if (newXSpeed !== null && newYSpeed !== null) {
            // Check against last queued direction or current direction to prevent 180° reverse
            let lastDirX = this.xspeed;
            let lastDirY = this.yspeed;

            if (this.inputQueue.length > 0) {
                const lastInput = this.inputQueue[this.inputQueue.length - 1];
                lastDirX = lastInput.xspeed;
                lastDirY = lastInput.yspeed;
            }

            // Prevent direct reversal
            if (newXSpeed !== -lastDirX || newYSpeed !== -lastDirY) {
                if (this.inputQueue.length < 2) {
                    this.inputQueue.push({ xspeed: newXSpeed, yspeed: newYSpeed });
                    sfx.playTurn();
                }
            }
        }
    }

    addPart() {
        const lastPart = this.parts[this.parts.length - 1] || new Part(this.x, this.y);
        this.parts.push(new Part(lastPart.x, lastPart.y));
    }

    update() {
        // Process next direction from queue if available
        if (this.inputQueue.length > 0) {
            const nextDir = this.inputQueue.shift();
            this.xspeed = nextDir.xspeed;
            this.yspeed = nextDir.yspeed;
        }

        let nextX = this.x + this.xspeed;
        let nextY = this.y + this.yspeed;

        const mode = store.getters.gameMode;

        if (mode === 'portal') {
            // Wrap around edges
            if (nextX < 0) nextX = this.game.width - 1;
            if (nextX >= this.game.width) nextX = 0;
            if (nextY < 0) nextY = this.game.height - 1;
            if (nextY >= this.game.height) nextY = 0;
        } else {
            // Classic mode: Wall collision
            if (nextX < 0 || nextY < 0 || nextX >= this.game.width || nextY >= this.game.height) {
                this.die();
                return;
            }
        }

        this.x = nextX;
        this.y = nextY;

        // Move body segments
        for (let i = this.parts.length - 1; i > 0; i--) {
            this.parts[i].x = this.parts[i - 1].x;
            this.parts[i].y = this.parts[i - 1].y;
        }
        if (this.parts.length > 0) {
            this.parts[0].x = this.x;
            this.parts[0].y = this.y;
        }

        // Check self-collision (head with rest of body)
        for (let i = 1; i < this.parts.length; i++) {
            if (this.x === this.parts[i].x && this.y === this.parts[i].y) {
                this.die();
                return;
            }
        }
    }

    die() {
        this.game.finishLoop();
        sfx.playGameOver();

        const date = new Date().toISOString();
        const lastScore = this.game.scoreValue;

        finishGame({ finished: true, score: lastScore });
        saveScore({
            score: lastScore,
            date: date,
            mode: store.getters.gameMode,
            difficulty: this.game.fps
        });
    }
}

class Food {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.pulse = 0;
        this.placeFood();
    }

    placeFood() {
        const occupied = new Set();
        if (this.game.snake && this.game.snake.parts) {
            this.game.snake.parts.forEach(p => occupied.add(`${p.x},${p.y}`));
        }

        const freeCells = [];
        for (let x = 0; x < this.game.width; x++) {
            for (let y = 0; y < this.game.height; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    freeCells.push({ x, y });
                }
            }
        }

        if (freeCells.length > 0) {
            const chosen = freeCells[Math.floor(Math.random() * freeCells.length)];
            this.x = chosen.x;
            this.y = chosen.y;
        } else {
            this.x = Math.floor(Math.random() * this.game.width);
            this.y = Math.floor(Math.random() * this.game.height);
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.alpha = 1;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.05;
    }
}

class CanvasRenderer {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.setupCanvas();
    }

    setupCanvas() {
        let canvas = document.getElementById('game-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'game-canvas';
            this.game.stage.appendChild(canvas);
        }

        const dpr = window.devicePixelRatio || 1;
        const totalPxWidth = this.game.width * this.game.size;
        const totalPxHeight = this.game.height * this.game.size;

        canvas.width = totalPxWidth * dpr;
        canvas.height = totalPxHeight * dpr;
        canvas.style.width = `${totalPxWidth}px`;
        canvas.style.height = `${totalPxHeight}px`;

        this.ctx = canvas.getContext('2d');
        this.ctx.scale(dpr, dpr);
    }

    spawnEatParticles(gridX, gridY) {
        const px = gridX * this.game.size + this.game.size / 2;
        const py = gridY * this.game.size + this.game.size / 2;
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(px, py));
        }
    }

    render() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const widthPx = this.game.width * this.game.size;
        const heightPx = this.game.height * this.game.size;
        const size = this.game.size;

        // Clear background
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, widthPx, heightPx);

        // Draw crisp monochrome grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.game.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * size, 0);
            ctx.lineTo(x * size, heightPx);
            ctx.stroke();
        }
        for (let y = 0; y <= this.game.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * size);
            ctx.lineTo(widthPx, y * size);
            ctx.stroke();
        }

        // Draw Food (Glowing monochrome orb with outer ring)
        const food = this.game.food;
        if (food) {
            const foodCenterX = food.x * size + size / 2;
            const foodCenterY = food.y * size + size / 2;

            // Outer pulse aura
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(foodCenterX, foodCenterY, size * 0.45, 0, Math.PI * 2);
            ctx.fill();

            // Inner food core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(foodCenterX, foodCenterY, size * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw Snake
        const snake = this.game.snake;
        if (snake && snake.parts) {
            for (let i = snake.parts.length - 1; i >= 0; i--) {
                const part = snake.parts[i];
                const px = part.x * size;
                const py = part.y * size;

                const isHead = (i === 0);

                if (isHead) {
                    // Snake Head - Pure White rounded box with directional indicators
                    ctx.save();
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                    ctx.shadowBlur = 8;
                    this.drawRoundedRect(ctx, px + 1, py + 1, size - 2, size - 2, 6);
                    ctx.fill();

                    // Eyes / Direction indicators
                    ctx.fillStyle = '#09090b';
                    const eyeSize = 3;
                    let eye1X = px + size / 3;
                    let eye1Y = py + size / 3;
                    let eye2X = px + (size * 2) / 3;
                    let eye2Y = py + size / 3;

                    if (snake.xspeed === 1) { // Moving Right
                        eye1X = px + (size * 2) / 3;
                        eye1Y = py + size / 4;
                        eye2X = px + (size * 2) / 3;
                        eye2Y = py + (size * 3) / 4;
                    } else if (snake.xspeed === -1) { // Moving Left
                        eye1X = px + size / 3;
                        eye1Y = py + size / 4;
                        eye2X = px + size / 3;
                        eye2Y = py + (size * 3) / 4;
                    } else if (snake.yspeed === 1) { // Moving Down
                        eye1X = px + size / 4;
                        eye1Y = py + (size * 2) / 3;
                        eye2X = px + (size * 3) / 4;
                        eye2Y = py + (size * 2) / 3;
                    } else if (snake.yspeed === -1) { // Moving Up
                        eye1X = px + size / 4;
                        eye1Y = py + size / 3;
                        eye2X = px + (size * 3) / 4;
                        eye2Y = py + size / 3;
                    }

                    ctx.beginPath();
                    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
                    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Snake Body Segments (Monochrome gradient scale)
                    const opacity = Math.max(0.35, 1 - (i / snake.parts.length) * 0.6);
                    ctx.save();
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.drawRoundedRect(ctx, px + 2, py + 2, size - 4, size - 4, 4);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // Draw active eating particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            } else {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

class Game {
    constructor(width, height, size, fps) {
        this.width = width;
        this.height = height;
        this.size = size;
        this.fps = fps;

        this.stage = document.getElementById('stage');
        this.scoreElement = document.getElementById('score');
        this.scoreValue = 0;
        this.intervalId = null;

        this.renderer = new CanvasRenderer(this);
        this.food = new Food(this);
        this.snake = new Snake(this, 3, 3, 3);

        this.finishLoop();
        this.startLoop();
    }

    startLoop() {
        this.finishLoop();
        this.intervalId = setInterval(() => {
            this.update();
        }, 1000 / this.fps);
        return true;
    }

    finishLoop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        return false;
    }

    update() {
        if (this.scoreElement) {
            this.scoreElement.innerHTML = this.scoreValue;
        }

        this.snake.update();

        // Check food collision
        if (this.snake.x === this.food.x && this.snake.y === this.food.y) {
            this.renderer.spawnEatParticles(this.food.x, this.food.y);
            sfx.playEat();
            this.food.placeFood();
            this.snake.addPart();
            this.scoreValue += 10;

            const maxCells = this.width * this.height;
            if (this.snake.parts.length >= maxCells) {
                this.snake.die();
                sfx.playWin();
                winGame();
            }
        }

        this.renderer.render();
    }
}

function saveScore(scoreData) {
    store.dispatch('SAVE_SCORE', scoreData);
}

function finishGame(lastGame) {
    store.dispatch('TOGGLE_GAME', lastGame);
}

function winGame() {
    store.dispatch('WIN_GAME', true);
}

export default Game;
