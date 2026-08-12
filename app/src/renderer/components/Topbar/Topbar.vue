<template>
    <header id="topbar">
        <div class="topbar-container">
            <router-link to="/" class="brand">
                <div class="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
                        <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
                        <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
                        <circle cx="6.5" cy="17.5" r="3.5" fill="currentColor"/>
                    </svg>
                </div>
                <span class="brand-title">SPACE<span class="brand-accent">SNAKE</span></span>
            </router-link>

            <div class="nav-actions">
                <div class="high-score-badge" v-if="highScore > 0" title="All-Time High Score">
                    <span class="badge-label">BEST</span>
                    <span class="badge-value">{{ highScore }}</span>
                </div>

                <nav class="nav-links">
                    <router-link to="/" exact class="nav-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Play</span>
                    </router-link>
                    <router-link to="/leaderboard" class="nav-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1z"></path>
                            <path d="M14 4h-3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"></path>
                            <path d="M22 14h-3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z"></path>
                        </svg>
                        <span>Leaderboard</span>
                    </router-link>
                </nav>
            </div>
        </div>
    </header>
</template>

<script>
    export default {
        name: 'topbar',
        computed: {
            highScore() {
                const scores = this.$store.getters.allScores;
                return scores.length > 0 ? scores[0].score : 0;
            }
        }
    };
</script>

<style scoped lang="scss">
    #topbar {
        background-color: rgba(18, 18, 21, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid $color-border;
        position: sticky;
        top: 0;
        z-index: 100;
        width: 100%;

        .topbar-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.2rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 1.2rem;
            text-decoration: none;
            color: $color-white;

            .logo-icon {
                width: 38px;
                height: 38px;
                background: $color-white;
                color: $color-black;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

                svg {
                    display: block;
                }
            }

            &:hover .logo-icon {
                transform: scale(1.08) rotate(-3deg);
            }

            .brand-title {
                font-size: 1.8rem;
                font-weight: 800;
                letter-spacing: 0.15em;
                color: $color-white;
                font-family: $font-family;

                .brand-accent {
                    color: $color-gray-400;
                    font-weight: 300;
                }
            }
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .high-score-badge {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.5rem 1rem;
            background: $color-surface-elevated;
            border: 1px solid $color-border-strong;
            border-radius: $radius-full;
            font-size: 1.2rem;

            .badge-label {
                color: $color-muted;
                font-weight: 700;
                font-size: 1rem;
                letter-spacing: 0.08em;
            }

            .badge-value {
                color: $color-white;
                font-weight: 800;
                font-family: $font-mono;
            }
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            background: $color-surface-elevated;
            padding: 0.4rem;
            border-radius: $radius-primary;
            border: 1px solid $color-border;
        }

        .nav-link {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.6rem 1.4rem;
            color: $color-muted;
            font-weight: 600;
            font-size: 1.3rem;
            text-decoration: none;
            border-radius: $radius-small;
            transition: $transition-fast;

            &:hover {
                color: $color-white;
                background: rgba(255, 255, 255, 0.08);
            }

            &.router-link-active {
                color: $color-black;
                background: $color-white;
                font-weight: 700;
            }
        }
    }

    @media (max-width: 48rem) {
        #topbar {
            .topbar-container {
                padding: 1rem 1.5rem;
            }

            .brand-title {
                font-size: 1.5rem;
            }

            .high-score-badge {
                display: none;
            }

            .nav-link span {
                display: none;
            }

            .nav-link {
                padding: 0.8rem;
            }
        }
    }
</style>
