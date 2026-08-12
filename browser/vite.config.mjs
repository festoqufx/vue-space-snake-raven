import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The original app keeps its runtime deps in app/node_modules (and uses
// sass-resources-loader to inject variables/mixins into every scss file).
// We mirror that here: alias the Vue-ecosystem packages to app/node_modules
// and inject the shared variables/mixins via sass additionalData.

const appModules = path.resolve(__dirname, '../app/node_modules')
const stylesDir = path.resolve(__dirname, '../app/src/renderer/styles')
const slash = (p) => p.replace(/\\/g, '/')

export default defineConfig({
    plugins: [vue()],
    resolve: {
        // Mirror the original webpack resolve.extensions ('.vue' is not in
        // Vite's defaults, but the source imports components extensionless).
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
        alias: {
            vue: path.join(appModules, 'vue'),
            'vue-router': path.join(appModules, 'vue-router'),
            vuex: path.join(appModules, 'vuex'),
            'vue-resource': path.join(appModules, 'vue-resource'),
            components: path.join(__dirname, '../app/src/renderer/components'),
            renderer: path.join(__dirname, '../app/src/renderer')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "${slash(path.join(stylesDir, 'variables.scss'))}"; @import "${slash(path.join(stylesDir, 'mixins.scss'))}"; `
            }
        }
    },
    server: {
        port: 9080,
        open: true
    }
})
