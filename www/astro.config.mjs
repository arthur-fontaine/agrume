import { defineConfig } from 'astro/config'
import orama from '@orama/plugin-astro'
import remarkGithubBetaBlockquoteAdmonitions from 'remark-github-beta-blockquote-admonitions'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/static'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  adapter: vercel({
    analytics: true,
    webAnalytics: { enabled: true },
  }),
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    orama({
      mydb: {
        contentSelectors: ['.content'],
        language: 'english',
        pathMatcher: /docs\/.+$/,
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      [remarkGithubBetaBlockquoteAdmonitions, {
        classNameMaps: {
          block: (/** @type {string} */ title) => `admonition admonition-${title.toLowerCase()}`,
          title: 'admonition-title',
        },
        titleTextMap: (/** @type {string} */ title) => {
          const normalizedTitle = title
            .substring(2, title.length - 1)
            .toLowerCase()
          const capitalizedTitle = normalizedTitle
            .charAt(0)
            .toUpperCase()
            + normalizedTitle.slice(1)

          return {
            checkedTitle: capitalizedTitle,
            // To remove the `[!` prefix and `]` suffix
            displayTitle: capitalizedTitle,
          }
        },
      }],
    ],
    shikiConfig: {
      theme: 'slack-dark',
    },
  },
  output: 'static',
  vite: {
    plugins: [
      Icons({
        // experimental
        autoInstall: true,
        compiler: 'astro',
      }),
    ],
  },
})
