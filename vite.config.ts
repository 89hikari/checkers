import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import svgr from 'vite-plugin-svgr'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 3000
    },
    resolve: {
        alias: {
            "@": path.join(__dirname, "src/"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    let extType = assetInfo.name.split('.').at(1);
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = 'img';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        }
    }
})

