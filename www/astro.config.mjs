import { defineConfig } from 'astro/config';
import orama from '@orama/plugin-astro';
import remarkGithubBetaBlockquoteAdmonitions from 'remark-github-beta-blockquote-admonitions';
import react from '@astrojs/react';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      Icons({
        compiler: 'astro',
        // experimental
        autoInstall: true,
      }),
    ],
  },
  markdown: {
    shikiConfig: {
      theme: 'slack-dark'
    },
    remarkPlugins: [
      // @ts-ignore
      [remarkGithubBetaBlockquoteAdmonitions, {
        classNameMaps: {
          block: (/** @type {string} */ title) => `admonition admonition-${title.toLowerCase()}`,
          title: 'admonition-title',
        },
        titleTextMap: (/** @type {string} */ title) => {
          const normalizedTitle = title.substring(2, title.length - 1).toLowerCase();
          const capitalizedTitle = normalizedTitle.charAt(0).toUpperCase() + normalizedTitle.slice(1);

          return {
            // To remove the `[!` prefix and `]` suffix
            displayTitle: capitalizedTitle,
            checkedTitle: capitalizedTitle,
          }
        },
      }],
    ],
  },
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    orama({
      mydb: {
        pathMatcher: /docs\/.+$/,
        language: 'english',
        contentSelectors: ['.content'],
      },
    }),
  ],
});
