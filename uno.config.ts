import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        // @ts-expect-error typescript issue
        cil: () => import('@iconify-json/cil/icons.json').then(i => i.default),
      }
    }),
    presetWind3(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'DM Mono',
        condensed: 'Roboto Condensed',
        wisper: 'Bad Script',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  extendTheme: (theme) => {
    theme.colors.brand = '#C7453B';
    // --vp-c-brand-2: #E65244;
    // --vp-c-brand-3: #EA6B5E;
    // --vp-c-brand-soft: rgba(230, 82, 68, 0.14);'
  },
})
