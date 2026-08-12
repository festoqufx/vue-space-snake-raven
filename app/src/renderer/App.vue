<template>
    <div id="app">
        <topbar></topbar>

        <main>
            <transition :name="transitionName" mode="out-in" appear>
                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </transition>
        </main>
    </div>
</template>

<script>
    import Topbar from './components/Topbar';
    import store from './vuex/store';

    export default {
        store,

        components: {
            Topbar
        },

        computed: {
            transitionName() {
                return this.$route.path === '/' ? 'slide-right' : 'slide-left';
            }
        }
    };
</script>

<style lang="scss">
    @import './styles/milligram';

    #app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: $color-bg;
        color: $color-text;
        font-family: $font-family;
    }

    main {
        padding: 2.5rem 2rem;
        flex: 1;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
    }

    // Modern View Transitions

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .scale-enter-active {
        animation: scale-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .scale-leave-active {
        animation: scale-out 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes scale-in {
        0% {
            transform: scale(0.95);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    @keyframes scale-out {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0.95);
            opacity: 0;
        }
    }

    .slide-left-enter-active, .slide-left-leave-active,
    .slide-right-enter-active, .slide-right-leave-active {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .slide-left-enter {
        transform: translateX(20px);
        opacity: 0;
    }
    .slide-left-leave-to {
        transform: translateX(-20px);
        opacity: 0;
    }

    .slide-right-enter {
        transform: translateX(-20px);
        opacity: 0;
    }
    .slide-right-leave-to {
        transform: translateX(20px);
        opacity: 0;
    }
</style>
