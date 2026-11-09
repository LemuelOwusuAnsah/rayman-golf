import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://lemuelowusuansah.github.io',
  base: '/rayman-golf',
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['phaser']
    }
  }
})
