import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            // Fix for buffer polyfill
            buffer: 'buffer/',
        },
    },
})
