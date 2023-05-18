import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue"
import Components from "unplugin-vue-components/vite"
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'


const postcssPlugin = [autoprefixer(), tailwindcss()]

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    css: {
        postcss: {
            plugins: postcssPlugin
        }
    },
    resolve: {
        alias: {
            process: "process/browser",
            stream: "stream-browserify",
            zlib: "browserify-zlib",
            util: 'util',
            '@': resolve(__dirname, ".", "src"),
        }
    },
})
