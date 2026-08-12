import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import storage from './storage';

Vue.use(Vuex);

const state = {
    scores: storage.getScores(),
    lastGame: {
        finished: false,
        score: 0
    },
    gameWon: false,
    soundEnabled: true,
    gameMode: 'classic' // 'classic' or 'portal'
};

export default new Vuex.Store({
    state,
    actions,
    getters,
    mutations,
    strict: process.env.NODE_ENV !== 'production'
});
