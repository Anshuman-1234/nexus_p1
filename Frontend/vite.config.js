import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    resolve: {
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        reportCompressedSize: false,
        sourcemap: true
    },
    logLevel: 'info'
})
