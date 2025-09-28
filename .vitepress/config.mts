import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [
      UnoCSS(),
    ],
  },
  head: [
    ['link', { rel: 'icon', href: 'https://github.com/akcyp.png' }],
  ],
  srcDir: "pages",
  
  title: "akcyp",
  description: "portfolio",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects' },
      { text: 'Packages', link: '/packages' },
      { text: 'Blog', link: '/blog' }
    ],

    logo: {
      src: 'https://github.com/akcyp.png',
    },

    sidebar: {
      '/blog': [{
        text: 'Posts',
        items: [
          { text: 'Creating Table Component with Web Components', link: '/blog/web-components-table' },
          { text: 'Connecting Angular Templates with Web Components Table', link: '/blog/angular-web-components-table-integration' }
        ]
      }]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/akcyp/' }
    ]
  }
})
