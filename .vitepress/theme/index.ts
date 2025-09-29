// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import '@unocss/reset/tailwind.css';
import './style.css';
import 'virtual:uno.css';

import Layout from './layouts/Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {}
} satisfies Theme
