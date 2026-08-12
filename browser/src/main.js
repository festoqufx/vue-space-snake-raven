// Browser entry for Space Snake.
// This is the renderer from app/src/renderer, minus the Electron-only
// "vue-electron" plugin so it can run in a plain web browser.

import Vue from 'vue'
import Resource from 'vue-resource'
import VueRouter from 'vue-router'

import App from '../../app/src/renderer/App.vue'
import store from '../../app/src/renderer/vuex/store'
import routes from '../../app/src/renderer/routes'

// Global helper classes (.align-center, .shadow, ...) used across components.
import '../../app/src/renderer/styles/helpers.scss'

Vue.use(Resource)
Vue.use(VueRouter)

const router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes
})

/* eslint-disable no-new */
new Vue({
    router,
    store,
    ...App
}).$mount('#app')
