import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite' // 1. 引入新插件

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    // 🌟 新增以下這段設定
  server: {
    host: true, // 相當於 --host，對所有專案成員、手機開放連線
    port: 5174, // 預設使用 5173
  }
})
