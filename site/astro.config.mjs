import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dvorson.github.io',
  base: '/',
  server: { port: 4321 },
  build: {
    outDir: '../docs',
    format: 'directory'
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs'
    }
  }
});
