import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss';

export default defineConfig({
  shortcuts: [
    // Layout shortcuts
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    ['absolute-center', 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'],
    
    // Button shortcuts
    ['btn', 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer'],
    ['btn-primary', 'btn bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'],
    ['btn-secondary', 'btn bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'],
    ['btn-ghost', 'btn hover:bg-gray-100 dark:hover:bg-gray-800'],
    
    // Card shortcuts
    ['card', 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'],
    ['card-hover', 'card hover:shadow-md transition-shadow duration-200'],
    
    // Text shortcuts
    ['text-muted', 'text-gray-600 dark:text-gray-400'],
    ['text-primary', 'text-blue-600 dark:text-blue-400'],
    
    // Gaming specific
    ['game-card', 'card-hover overflow-hidden group cursor-pointer'],
    ['game-rating', 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'],
    ['platform-tag', 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200']
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      gaming: {
        purple: '#8b5cf6',
        pink: '#ec4899',
        orange: '#f97316',
        green: '#10b981'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500'
      }
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
});