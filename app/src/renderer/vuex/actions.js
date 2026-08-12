import * as types from './mutation-types';
import storage from './storage';

export default {
    SAVE_SCORE({ commit }, score) {
        storage.saveScore(score);
        commit(types.SAVE_SCORE, score);
    },

    CLEAR_SCORES({ commit }) {
        storage.clearScores();
        commit(types.CLEAR_SCORES);
    },

    TOGGLE_GAME({ commit }, lastGame) {
        commit(types.TOGGLE_GAME, lastGame);
    },

    WIN_GAME({ commit }, won) {
        commit(types.WIN_GAME, won);
    },

    SET_SOUND({ commit }, enabled) {
        commit(types.SET_SOUND, enabled);
    },

    SET_GAME_MODE({ commit }, mode) {
        commit(types.SET_GAME_MODE, mode);
    }
};
