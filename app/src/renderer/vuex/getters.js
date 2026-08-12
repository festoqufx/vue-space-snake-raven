export default {
    allScores(state) {
        return state.scores.concat().sort((scoreA, scoreB) => {
            return scoreB.score - scoreA.score;
        });
    },

    finishedGame(state) {
        return {
            finished: state.lastGame.finished,
            score: state.lastGame.score
        };
    },

    gameWon(state) {
        return state.gameWon;
    },

    soundEnabled(state) {
        return state.soundEnabled;
    },

    gameMode(state) {
        return state.gameMode;
    }
};
