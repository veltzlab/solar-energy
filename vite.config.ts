import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Ignora a pasta do servidor backend para não recarregar ao salvar sessão/conversas
      ignored: ['**/server/**', '**/crm-standalone/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Necessário para SSE (Server-Sent Events) não ficarem em buffer
        headers: { Connection: 'keep-alive' },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Garante que o content-type de SSE não seja alterado
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache, no-transform';
            }
          });
        },
      },
    },
  },
})
