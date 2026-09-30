// @ts-check
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

/**
 * Fills the placeholders of the home page boot log with real build facts
 * (page count, build duration, commit) once the build is done.
 * In dev the placeholders stay untouched and the boot log falls back gracefully.
 */
function buildInfo() {
  let started = 0;
  return {
    name: 'build-info',
    hooks: {
      'astro:build:start': () => {
        started = Date.now();
      },
      /** @param {{ dir: URL, pages: unknown[] }} ctx */
      'astro:build:done': ({ dir, pages }) => {
        let commit = (process.env.CF_PAGES_COMMIT_SHA || '').slice(0, 7);
        if (!commit) {
          try {
            commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
              .toString()
              .trim();
          } catch {
            // no git history (yet): the boot log simply omits the commit line
          }
        }
        const values = {
          __BUILD_PAGES__: String(pages.length),
          __BUILD_MS__: String(Date.now() - started),
          __BUILD_COMMIT__: commit,
        };
        /** @param {string} folder */
        const walk = (folder) => {
          for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
            const file = path.join(folder, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name.endsWith('.html')) {
              let html = fs.readFileSync(file, 'utf8');
              if (!html.includes('__BUILD_')) continue;
              for (const [token, value] of Object.entries(values)) html = html.replaceAll(token, value);
              fs.writeFileSync(file, html);
            }
          }
        };
        walk(fileURLToPath(dir));
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Switch to the final domain at launch (drives canonical, hreflang, og:image and the sitemap).
  site: 'https://portfolio.edelsbrunnernoah.workers.dev',
  integrations: [
    buildInfo(),
    mdx(),
    sitemap({ i18n: { defaultLocale: 'de', locales: { de: 'de-AT', en: 'en-US' } } }),
  ],
  markdown: {
    shikiConfig: { theme: 'tokyo-night' },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});