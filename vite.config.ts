import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // 仅在 desktop 模式下加载 Electron 插件，Web 模式不受影响
    ...(mode === 'desktop'
      ? [electron({
          main: {
            entry: 'electron/main.ts',
          },
          preload: {
            input: 'electron/preload.ts',
          },
          renderer: {},
        })]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
