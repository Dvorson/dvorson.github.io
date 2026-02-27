import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dvorson.github.io',
  base: '/',
  server: { port: 4321 },
  build: {
    outDir: './dist',
    format: 'directory'
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs'
    }
  },
  integrations: [sitemap({
    filter: (page) => !page.includes('/projects/')
  })]
});
