import Vue from 'vue';
import Resource from 'vue-resource';
import VueRouter from 'vue-router';

import App from './App';
import routes from './routes';

Vue.use(Resource);
Vue.use(VueRouter);
Vue.config.debug = process.env.NODE_ENV !== 'production';

const router = new VueRouter({
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes
});

/* eslint-disable no-new */
new Vue({
    router,
    ...App
}).$mount('#app');
