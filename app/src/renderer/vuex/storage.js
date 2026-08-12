const STORAGE_KEY = 'space_snake_scores_v2';
const storage = window.localStorage;

export default {
    saveScore(score) {
        const scores = this.getScores();
        scores.push(score);
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(scores));
        } catch (e) {
            console.error('Failed to save score to localStorage:', e);
        }
    },

    getScores() {
        // Try new array-based key first
        try {
            const raw = storage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Error loading scores from space_snake_scores_v2', e);
        }

        // Fallback: migrate legacy per-item score entries safely
        const legacyScores = [];
        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key !== STORAGE_KEY) {
                    try {
                        const val = JSON.parse(storage.getItem(key));
                        if (val && typeof val === 'object' && typeof val.score === 'number' && val.date) {
                            legacyScores.push(val);
                        }
                    } catch (err) {
                        // Ignore non-score JSON items
                    }
                }
            }
        } catch (e) {
            console.warn('Error loading legacy scores', e);
        }

        if (legacyScores.length > 0) {
            try {
                storage.setItem(STORAGE_KEY, JSON.stringify(legacyScores));
            } catch (e) {
                // ignore
            }
        }

        return legacyScores;
    },

    clearScores() {
        try {
            storage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear scores:', e);
        }
    }
};
