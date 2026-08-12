import * as types from './mutation-types';

export default {
    [types.SAVE_SCORE](state, score) {
        state.scores.push(score);
    },

    [types.CLEAR_SCORES](state) {
        state.scores = [];
    },

    [types.TOGGLE_GAME](state, lastGame) {
        state.lastGame.finished = lastGame.finished;
        state.lastGame.score = lastGame.score;
    },

    [types.WIN_GAME](state, won) {
        state.gameWon = won;
    },

    [types.SET_SOUND](state, enabled) {
        state.soundEnabled = enabled;
    },

    [types.SET_GAME_MODE](state, mode) {
        state.gameMode = mode;
    }
};
