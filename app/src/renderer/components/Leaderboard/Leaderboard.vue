<template>
    <transition name="fade">
        <div class="leaderboard-container">
            <div class="leaderboard-header">
                <div class="header-badge">HALL OF FAME</div>
                <h1>LEADERBOARD</h1>
                <p class="subtitle">Top performance metrics and high scores</p>
            </div>

            <div class="stats-overview" v-if="scores.length > 0">
                <div class="stat-card">
                    <span class="stat-label">HIGH SCORE</span>
                    <span class="stat-value">{{ topScore }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">GAMES PLAYED</span>
                    <span class="stat-value">{{ scores.length }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">AVERAGE SCORE</span>
                    <span class="stat-value">{{ avgScore }}</span>
                </div>
            </div>

            <div class="leaderboard-table-card" v-if="scores.length > 0">
                <div class="table-toolbar">
                    <span class="toolbar-title">RECENT HIGHEST RECORDS</span>
                    <button class="btn-clear" @click="confirmClearScores">
                        🗑 Clear Records
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-rank">RANK</th>
                                <th class="col-score">SCORE</th>
                                <th class="col-mode">MODE</th>
                                <th class="col-date">DATE & TIME</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(scoreObj, index) in scores" :key="index" :class="{ 'top-score-row': index === 0 }">
                                <td class="col-rank">
                                    <div class="rank-badge" :class="'rank-' + (index + 1)">
                                        <span v-if="index === 0">🥇</span>
                                        <span v-else-if="index === 1">🥈</span>
                                        <span v-else-if="index === 2">🥉</span>
                                        <span v-else>#{{ index + 1 }}</span>
                                    </div>
                                </td>
                                <td class="col-score">
                                    <span class="score-badge">{{ scoreObj.score }}</span>
                                </td>
                                <td class="col-mode">
                                    <span class="mode-pill" :class="scoreObj.mode || 'classic'">
                                        {{ (scoreObj.mode || 'classic').toUpperCase() }}
                                    </span>
                                </td>
                                <td class="col-date">
                                    {{ formattedDate(scoreObj.date) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="empty-state-card" v-else>
                <div class="empty-icon-glow">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>
                <h2>NO SCORES YET</h2>
                <p>Play a game of Space Snake to record your highest achievements here.</p>
                <router-link to="/" class="btn-primary-lg">PLAY NOW</router-link>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'leaderboard',

        computed: {
            scores() {
                return this.$store.getters.allScores;
            },

            topScore() {
                return this.scores.length > 0 ? this.scores[0].score : 0;
            },

            avgScore() {
                if (this.scores.length === 0) return 0;
                const total = this.scores.reduce((sum, item) => sum + item.score, 0);
                return Math.round(total / this.scores.length);
            }
        },

        methods: {
            formattedDate(dateString) {
                if (!dateString) return 'Just now';
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    return dateString;
                }
            },

            confirmClearScores() {
                if (window.confirm('Are you sure you want to clear all high score records?')) {
                    this.$store.dispatch('CLEAR_SCORES');
                }
            }
        }
    };
</script>

<style scoped lang="scss">
    .leaderboard-container {
        max-width: 860px;
        margin: 0 auto;
    }

    .leaderboard-header {
        text-align: center;
        margin-bottom: 2.5rem;

        .header-badge {
            display: inline-block;
            padding: 0.3rem 1rem;
            background: $color-surface-elevated;
            border: 1px solid $color-border;
            border-radius: $radius-full;
            font-size: 1.1rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            color: $color-muted;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 3.6rem;
            font-weight: 900;
            letter-spacing: 0.08em;
            color: $color-white;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            font-size: 1.4rem;
            color: $color-muted;
            margin: 0;
        }
    }

    .stats-overview {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.2rem;
        margin-bottom: 2rem;

        .stat-card {
            background: $color-surface;
            border: 1px solid $color-border;
            border-radius: $radius-lg;
            padding: 1.5rem;
            text-align: center;

            .stat-label {
                display: block;
                font-size: 1rem;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: $color-muted;
                margin-bottom: 0.5rem;
            }

            .stat-value {
                font-size: 3rem;
                font-weight: 900;
                font-family: $font-mono;
                color: $color-white;
            }
        }
    }

    .leaderboard-table-card {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-lg;
        overflow: hidden;
        box-shadow: $shadow-lg;

        .table-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.2rem 2rem;
            background: $color-surface-elevated;
            border-bottom: 1px solid $color-border;

            .toolbar-title {
                font-size: 1.1rem;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: $color-muted;
            }

            .btn-clear {
                background: transparent;
                border: 1px solid $color-border;
                color: $color-muted;
                padding: 0.4rem 1rem;
                border-radius: $radius-small;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: $transition-fast;

                &:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: $color-white;
                    border-color: $color-border-strong;
                }
            }
        }

        .table-responsive {
            max-height: 480px;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;

            thead {
                background: $color-surface;
                position: sticky;
                top: 0;
                z-index: 5;

                th {
                    padding: 1.2rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    color: $color-muted;
                    border-bottom: 1px solid $color-border;
                }
            }

            tbody tr {
                border-bottom: 1px solid $color-border;
                transition: $transition-fast;

                &:last-child {
                    border-bottom: none;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                &.top-score-row {
                    background: rgba(255, 255, 255, 0.05);

                    .score-badge {
                        background: $color-white;
                        color: $color-black;
                    }
                }

                td {
                    padding: 1.2rem 2rem;
                    font-size: 1.4rem;
                    color: $color-white;
                    vertical-align: middle;
                }
            }
        }

        .rank-badge {
            font-family: $font-mono;
            font-weight: 800;
            font-size: 1.4rem;

            &.rank-1 { color: #ffffff; font-size: 1.8rem; }
            &.rank-2 { color: #e4e4e7; font-size: 1.6rem; }
            &.rank-3 { color: #a1a1aa; font-size: 1.5rem; }
        }

        .score-badge {
            display: inline-block;
            padding: 0.3rem 1rem;
            background: $color-surface-elevated;
            border: 1px solid $color-border;
            border-radius: $radius-primary;
            font-family: $font-mono;
            font-weight: 800;
            font-size: 1.5rem;
            color: $color-white;
        }

        .mode-pill {
            display: inline-block;
            padding: 0.2rem 0.8rem;
            background: $color-bg;
            border: 1px solid $color-border;
            border-radius: $radius-full;
            font-size: 1rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: $color-muted;
        }

        .col-date {
            color: $color-muted;
            font-size: 1.3rem;
        }
    }

    .empty-state-card {
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-lg;
        padding: 4rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        .empty-icon-glow {
            width: 80px;
            height: 80px;
            background: $color-surface-elevated;
            border: 1px solid $color-border;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: $color-muted;
        }

        h2 {
            font-size: 2.4rem;
            font-weight: 900;
            margin-bottom: 0.8rem;
            color: $color-white;
        }

        p {
            color: $color-muted;
            font-size: 1.4rem;
            margin-bottom: 2rem;
            max-width: 400px;
        }

        .btn-primary-lg {
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-align: center;
            line-height: 1;
            box-sizing: border-box;
        }
    }

    @media (max-width: 600px) {
        .stats-overview {
            grid-template-columns: 1fr;
        }

        .table-responsive table {
            th, td {
                padding: 0.8rem 1rem;
            }
        }

        .col-mode, .col-date {
            font-size: 1.2rem;
        }
    }
</style>
