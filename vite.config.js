import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        buy: resolve(__dirname, 'buy.html'),
        sell: resolve(__dirname, 'sell.html'),
        communities: resolve(__dirname, 'communities.html'),
        listings: resolve(__dirname, 'listings.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
})
