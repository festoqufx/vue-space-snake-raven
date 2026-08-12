<template>
    <div class="game-wrapper">
        <div class="game-area">
            <div class="stage-container" id="stage" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
                <div class="greeting-overlay" v-if="!gameStarted">
                    <div class="greeting-content">
                        <div class="snake-icon-glow">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h1>SPACE SNAKE</h1>
                        <p class="subtitle">Classic Arcade Gameplay Reimagined</p>
                        <div class="start-hints">
                            <span class="hint-pill">Press <kbd>ENTER</kbd> or click Start</span>
                            <span class="hint-pill">Use <kbd>WASD</kbd> or <kbd>Arrow Keys</kbd></span>
                        </div>
                        <button class="btn-primary-lg" @click="startGame">START GAME</button>
                    </div>
                </div>

                <transition name="fade">
                    <div class="overlay" v-if="gamePaused">
                        <div class="overlay-card">
                            <div class="overlay-icon">⏸</div>
                            <h3>GAME PAUSED</h3>
                            <p>Press <kbd>SPACE</kbd> or <kbd>P</kbd> to resume</p>
                            <button class="btn-primary" @click="resumeGame">RESUME</button>
                        </div>
                    </div>

                    <div class="overlay" v-if="lastGame.finished && !gameWon">
                        <div class="overlay-card">
                            <div class="overlay-badge">GAME OVER</div>
                            <div class="score-summary">
                                <span class="score-num">{{ lastGame.lastScore }}</span>
                                <span class="score-unit">POINTS</span>
                            </div>
                            <p class="new-high" v-if="isNewHighScore">🎉 NEW HIGH SCORE!</p>
                            <button class="btn-primary-lg" @click="startGame">PLAY AGAIN</button>
                        </div>
                    </div>

                    <div class="overlay overlay-win" v-if="gameWon">
                        <div class="overlay-card">
                            <div class="overlay-badge victory">VICTORY!</div>
                            <h3>PERFECT SCORE</h3>
                            <div class="score-summary">
                                <span class="score-num">{{ lastGame.lastScore }}</span>
                                <span class="score-unit">POINTS</span>
                            </div>
                            <button class="btn-primary-lg" @click="startGame">PLAY AGAIN</button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="sidebar-area">
            <div class="sidebar-card score-card">
                <span class="card-label">CURRENT SCORE</span>
                <div class="score-value" id="score">0</div>
            </div>

            <div class="sidebar-card action-card">
                <button class="btn-action" @click="startGame" v-if="!gameStarted || lastGame.finished">
                    ▶ START GAME
                </button>
                <div v-else class="pause-resume-group">
                    <button class="btn-action" @click="pauseGame" v-if="isPlaying">⏸ PAUSE</button>
                    <button class="btn-action" @click="resumeGame" v-if="!isPlaying">▶ RESUME</button>
                </div>
            </div>

            <div class="sidebar-card settings-card">
                <span class="card-label">GAME MODE</span>
                <div class="segmented-control">
                    <button 
                        class="segment-btn" 
                        :class="{ active: currentMode === 'classic' }"
                        @click="setMode('classic')">
                        WALLS
                    </button>
                    <button 
                        class="segment-btn" 
                        :class="{ active: currentMode === 'portal' }"
                        @click="setMode('portal')">
                        PORTAL
                    </button>
                </div>

                <span class="card-label margin-top">SPEED & DIFFICULTY</span>
                <div class="speed-presets">
                    <button 
                        v-for="preset in speedPresets" 
                        :key="preset.val"
                        class="preset-btn"
                        :class="{ active: difficulty === preset.val }"
                        @click="setDifficulty(preset.val)">
                        {{ preset.label }}
                    </button>
                </div>

                <span class="card-label margin-top">SOUND EFFECTS</span>
                <button class="btn-toggle-sound" @click="toggleSound">
                    <span v-if="soundOn">🔊 Audio Enabled</span>
                    <span v-else>🔇 Audio Muted</span>
                </button>
            </div>

            <div class="sidebar-card controls-card">
                <span class="card-label">D-PAD CONTROLS</span>
                <div class="dpad">
                    <span class="dpad-cell"></span>
                    <button class="dpad-btn" :class="{ pressed: isUpButtonPressed }" @click="buttonPressed(38)">▲</button>
                    <span class="dpad-cell"></span>

                    <button class="dpad-btn" :class="{ pressed: isLeftButtonPressed }" @click="buttonPressed(37)">◄</button>
                    <span class="dpad-cell dpad-center"></span>
                    <button class="dpad-btn" :class="{ pressed: isRightButtonPressed }" @click="buttonPressed(39)">►</button>

                    <span class="dpad-cell"></span>
                    <button class="dpad-btn" :class="{ pressed: isDownButtonPressed }" @click="buttonPressed(40)">▼</button>
                    <span class="dpad-cell"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Game, { sfx } from './Game.js';

    export default {
        name: 'game',

        data() {
            return {
                game: null,
                difficulty: 12,
                isPlaying: false,
                gameStarted: false,
                gamePaused: false,
                isLeftButtonPressed: false,
                isUpButtonPressed: false,
                isRightButtonPressed: false,
                isDownButtonPressed: false,
                touchStartX: null,
                touchStartY: null,
                speedPresets: [
                    { label: 'Easy', val: 8 },
                    { label: 'Normal', val: 12 },
                    { label: 'Fast', val: 18 },
                    { label: 'Insane', val: 24 }
                ]
            };
        },

        computed: {
            lastGame() {
                return {
                    finished: this.$store.getters.finishedGame.finished,
                    lastScore: this.$store.getters.finishedGame.score
                };
            },

            gameWon() {
                return this.$store.getters.gameWon;
            },

            soundOn() {
                return this.$store.getters.soundEnabled;
            },

            currentMode() {
                return this.$store.getters.gameMode;
            },

            isNewHighScore() {
                const scores = this.$store.getters.allScores;
                if (!scores || scores.length <= 1) return true;
                return this.lastGame.lastScore >= scores[0].score && this.lastGame.lastScore > 0;
            }
        },

        methods: {
            startGame() {
                this.removeCanvas();

                // 24 grid tiles x 24px = 576px canvas arena
                this.game = new Game(24, 24, 24, this.difficulty);

                this.gameStarted = true;
                this.isPlaying = true;
                this.gamePaused = false;

                this.$store.dispatch('TOGGLE_GAME', { finished: false, score: 0 });
                this.$store.dispatch('WIN_GAME', false);
            },

            pauseGame() {
                if (this.game) {
                    this.isPlaying = this.game.finishLoop();
                    this.gamePaused = true;
                }
            },

            resumeGame() {
                if (this.game) {
                    this.isPlaying = this.game.startLoop();
                    this.gamePaused = false;
                }
            },

            setMode(mode) {
                this.$store.dispatch('SET_GAME_MODE', mode);
            },

            setDifficulty(val) {
                this.difficulty = val;
                if (this.game && this.isPlaying) {
                    this.game.fps = val;
                    this.game.startLoop();
                }
            },

            toggleSound() {
                this.$store.dispatch('SET_SOUND', !this.soundOn);
            },

            buttonPressed(key) {
                // Enter key to start/restart
                if (key === 13 && (!this.gameStarted || this.lastGame.finished)) {
                    this.startGame();
                    return;
                }

                // Space or 'P' key to pause/resume
                if ((key === 32 || key === 80) && this.gameStarted && !this.lastGame.finished) {
                    if (this.isPlaying) {
                        this.pauseGame();
                    } else {
                        this.resumeGame();
                    }
                    return;
                }

                // Snake steering
                if (this.gameStarted && this.isPlaying && this.game && this.game.snake) {
                    this.game.snake.controller(key);
                }

                let btnName = '';
                if (key === 37 || key === 65) btnName = 'Left';
                if (key === 38 || key === 87) btnName = 'Up';
                if (key === 39 || key === 68) btnName = 'Right';
                if (key === 40 || key === 83) btnName = 'Down';

                if (btnName) {
                    this[`is${btnName}ButtonPressed`] = true;
                    setTimeout(() => {
                        this[`is${btnName}ButtonPressed`] = false;
                    }, 150);
                }
            },

            onTouchStart(e) {
                if (!e.touches || !e.touches[0]) return;
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            },

            onTouchMove(e) {
                if (e.cancelable) e.preventDefault();
            },

            onTouchEnd(e) {
                if (this.touchStartX === null || this.touchStartY === null) return;
                if (!e.changedTouches || !e.changedTouches[0]) return;

                const deltaX = e.changedTouches[0].clientX - this.touchStartX;
                const deltaY = e.changedTouches[0].clientY - this.touchStartY;

                const minSwipeDist = 20;
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDist) {
                    if (deltaX > 0) this.buttonPressed(39); // Right
                    else this.buttonPressed(37); // Left
                } else if (Math.abs(deltaY) > minSwipeDist) {
                    if (deltaY > 0) this.buttonPressed(40); // Down
                    else this.buttonPressed(38); // Up
                }

                this.touchStartX = null;
                this.touchStartY = null;
            },

            removeCanvas() {
                const stage = document.getElementById('stage');
                if (stage) {
                    const canvas = stage.querySelector('canvas');
                    if (canvas) {
                        stage.removeChild(canvas);
                    }
                }
            }
        },

        created() {
            this._keyHandler = (e) => {
                // Prevent browser scrolling on game keys
                if ([13, 32, 37, 38, 39, 40, 65, 68, 80, 83, 87].includes(e.keyCode)) {
                    // Do not prevent default if typing in input
                    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
                    e.preventDefault();
                }
                this.buttonPressed(e.keyCode);
            };
            window.addEventListener('keydown', this._keyHandler);
        },

        beforeDestroy() {
            window.removeEventListener('keydown', this._keyHandler);
            if (this.game) {
                this.game.finishLoop();
            }
        }
    };
</script>

<style scoped lang="scss">
    .game-wrapper {
        display: flex;
        gap: 2.5rem;
        align-items: flex-start;
        justify-content: center;
    }

    .game-area {
        flex: 1;
        display: flex;
        justify-content: center;
        max-width: 600px;
    }

    .stage-container {
        position: relative;
        width: 576px;
        height: 576px;
        background: #09090b;
        border: 2px solid $color-border-strong;
        border-radius: $radius-lg;
        box-shadow: $shadow-xl;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: none;
    }

    .greeting-overlay {
        position: absolute;
        inset: 0;
        background: rgba(9, 9, 11, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        padding: 2rem;

        .greeting-content {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;

            .snake-icon-glow {
                width: 72px;
                height: 72px;
                background: $color-white;
                color: $color-black;
                border-radius: $radius-lg;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1.5rem;
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
            }

            h1 {
                font-size: 3.6rem;
                font-weight: 900;
                letter-spacing: 0.12em;
                margin-bottom: 0.5rem;
                color: $color-white;
            }

            .subtitle {
                font-size: 1.4rem;
                color: $color-muted;
                margin-bottom: 2rem;
            }

            .start-hints {
                display: flex;
                gap: 1rem;
                margin-bottom: 2.5rem;
                flex-wrap: wrap;
                justify-content: center;

                .hint-pill {
                    padding: 0.5rem 1rem;
                    background: $color-surface-elevated;
                    border: 1px solid $color-border;
                    border-radius: $radius-full;
                    font-size: 1.2rem;
                    color: $color-muted;

                    kbd {
                        background: $color-white;
                        color: $color-black;
                        padding: 0.1rem 0.5rem;
                        border-radius: 4px;
                        font-weight: 700;
                        font-family: $font-mono;
                    }
                }
            }
        }
    }

    .btn-primary-lg {
        background: $color-white;
        color: $color-black;
        border: none;
        border-radius: $radius-primary;
        padding: 1.2rem 3rem;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: $transition-fast;
        box-shadow: $shadow-md;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        text-align: center;
        line-height: 1;
        box-sizing: border-box;

        &:hover {
            transform: translateY(-2px);
            box-shadow: $shadow-glow;
            background: #e4e4e7;
        }

        &:active {
            transform: translateY(0);
        }
    }

    .btn-primary {
        background: $color-white;
        color: $color-black;
        border: none;
        border-radius: $radius-primary;
        padding: 0.8rem 2rem;
        font-size: 1.3rem;
        font-weight: 700;
        cursor: pointer;
        transition: $transition-fast;

        &:hover {
            background: #e4e4e7;
        }
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(9, 9, 11, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;

        .overlay-card {
            background: $color-surface-elevated;
            border: 1px solid $color-border-strong;
            border-radius: $radius-lg;
            padding: 3rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 280px;
            box-shadow: $shadow-xl;

            .overlay-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .overlay-badge {
                padding: 0.4rem 1.2rem;
                background: $color-border-strong;
                color: $color-white;
                border-radius: $radius-full;
                font-size: 1.1rem;
                font-weight: 800;
                letter-spacing: 0.1em;
                margin-bottom: 1.5rem;

                &.victory {
                    background: $color-white;
                    color: $color-black;
                }
            }

            h3 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }

            p {
                color: $color-muted;
                font-size: 1.3rem;
                margin-bottom: 1.5rem;

                kbd {
                    background: $color-border;
                    color: $color-white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-family: $font-mono;
                }
            }

            .score-summary {
                margin: 1.5rem 0 2rem;

                .score-num {
                    display: block;
                    font-size: 5rem;
                    font-weight: 900;
                    font-family: $font-mono;
                    color: $color-white;
                    line-height: 1;
                }

                .score-unit {
                    font-size: 1.1rem;
                    color: $color-muted;
                    letter-spacing: 0.12em;
                    font-weight: 700;
                }
            }

            .new-high {
                color: #ffffff;
                font-weight: 800;
                font-size: 1.4rem;
                margin-bottom: 1.5rem;
            }
        }
    }

    .sidebar-area {
        width: 280px;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
    }

    .sidebar-card {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-lg;
        padding: 1.5rem;

        .card-label {
            display: block;
            font-size: 1rem;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: $color-muted;
            margin-bottom: 0.8rem;

            &.margin-top {
                margin-top: 1.2rem;
            }
        }
    }

    .score-card {
        text-align: center;
        background: linear-gradient(180deg, $color-surface-elevated 0%, $color-surface 100%);

        .score-value {
            font-size: 4.2rem;
            font-weight: 900;
            font-family: $font-mono;
            color: $color-white;
            line-height: 1;
        }
    }

    .action-card {
        padding: 0.8rem;

        .btn-action {
            width: 100%;
            padding: 1rem;
            background: $color-white;
            color: $color-black;
            border: none;
            border-radius: $radius-primary;
            font-weight: 800;
            font-size: 1.3rem;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: $transition-fast;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-align: center;
            line-height: 1;
            box-sizing: border-box;

            &:hover {
                background: #e4e4e7;
            }
        }

        .pause-resume-group {
            width: 100%;
        }
    }

    .segmented-control {
        display: flex;
        background: $color-bg;
        padding: 0.3rem;
        border-radius: $radius-primary;
        border: 1px solid $color-border;

        .segment-btn {
            flex: 1;
            padding: 0.6rem;
            background: transparent;
            border: none;
            border-radius: $radius-small;
            color: $color-muted;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: $transition-fast;

            &.active {
                background: $color-white;
                color: $color-black;
            }
        }
    }

    .speed-presets {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;

        .preset-btn {
            padding: 0.6rem;
            background: $color-bg;
            border: 1px solid $color-border;
            border-radius: $radius-small;
            color: $color-muted;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: $transition-fast;

            &:hover {
                border-color: $color-border-strong;
                color: $color-white;
            }

            &.active {
                background: $color-surface-elevated;
                border-color: $color-white;
                color: $color-white;
                font-weight: 700;
            }
        }
    }

    .btn-toggle-sound {
        width: 100%;
        padding: 0.7rem;
        background: $color-bg;
        border: 1px solid $color-border;
        border-radius: $radius-small;
        color: $color-white;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: $transition-fast;

        &:hover {
            background: $color-surface-elevated;
        }
    }

    .controls-card {
        .dpad {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 0.4rem;
            width: 100%;
            max-width: 168px;
            margin: 0 auto;
            padding: 0.75rem;
            background: $color-bg;
            border: 1px solid $color-border;
            border-radius: $radius-lg;
            box-sizing: border-box;

            .dpad-cell {
                display: block;
            }

            .dpad-btn {
                width: 100%;
                aspect-ratio: 1;
                min-width: 0;
                background: $color-surface-elevated;
                border: 1px solid $color-border-strong;
                border-radius: $radius-small;
                color: $color-white;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: $transition-fast;
                padding: 0;
                line-height: 1;
                box-sizing: border-box;

                &:hover {
                    background: $color-white;
                    color: $color-black;
                    border-color: $color-black;
                }

                &.pressed {
                    background: $color-white;
                    color: $color-black;
                    border-color: $color-black;
                    transform: scale(0.9);
                }
            }
        }
    }

    @media (max-width: 900px) {
        .game-wrapper {
            flex-direction: column;
            align-items: center;
        }

        .stage-container {
            width: 100%;
            max-width: 500px;
            height: 500px;
        }

        .sidebar-area {
            width: 100%;
            max-width: 500px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
        }

        .controls-card {
            grid-column: span 2;
        }
    }
</style>
