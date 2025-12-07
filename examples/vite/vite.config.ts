import vue from '@vitejs/plugin-vue'
import discofetch from 'discofetch/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    discofetch({
      baseUrl: 'https://jsonplaceholder.typicode.com',

      probes: {
        get: {
          '/todos/{id}': {
            params: { id: 1 },
          },
        },
      },
    }),
  ],
})
