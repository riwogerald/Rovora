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
    
    // Gaming-specific shortcuts
    ['controller-btn', 'inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200'],
    ['controller-active', 'bg-gaming-primary border-gaming-primary text-white shadow-lg scale-110'],
    ['controller-inactive', 'bg-surface-100-800-token border-surface-300-600-token hover:border-gaming-primary/50'],
    
    // Card shortcuts
    ['game-card', 'card variant-ghost-surface hover:variant-soft-primary transition-all duration-300 cursor-pointer group'],
    ['codex-entry', 'card variant-ghost-surface border-l-4 border-l-gaming-accent'],
    ['platform-badge', 'badge variant-soft-secondary'],
    
    // Button variants
    ['btn-gaming', 'btn variant-filled-primary bg-gradient-to-r from-gaming-primary to-gaming-secondary'],
    ['btn-controller', 'btn variant-ghost-surface border border-gaming-primary/30 hover:border-gaming-primary'],
    
    // Text shortcuts
    ['text-gaming', 'text-gaming-primary'],
    ['text-muted', 'text-surface-500-400-token'],
    ['text-accent', 'text-gaming-accent'],
    
    // Status indicators
    ['status-playing', 'w-3 h-3 rounded-full bg-green-500 animate-pulse'],
    ['status-completed', 'w-3 h-3 rounded-full bg-blue-500'],
    ['status-dropped', 'w-3 h-3 rounded-full bg-red-500'],
    ['status-backlog', 'w-3 h-3 rounded-full bg-yellow-500'],
    ['status-wishlist', 'w-3 h-3 rounded-full bg-purple-500']
  ],
  theme: {
    colors: {
      gaming: {
        primary: '#6366f1',    // Indigo
        secondary: '#8b5cf6',  // Violet
        accent: '#f59e0b',     // Amber
        success: '#10b981',    // Emerald
        warning: '#f59e0b',    // Amber
        error: '#ef4444',      // Red
        surface: '#1e293b',    // Slate-800
        'surface-light': '#334155', // Slate-700
        'text-primary': '#f8fafc',   // Slate-50
        'text-secondary': '#cbd5e1'  // Slate-300
      },
      controller: {
        xbox: '#107c10',
        playstation: '#003087',
        nintendo: '#e60012',
        steam: '#1b2838',
        epic: '#313131',
        gog: '#86328a'
      }
    },
    fontFamily: {
      sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      gaming: ['Orbitron Variable', 'Orbitron', 'monospace']
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
      'controller-press': 'controllerPress 0.1s ease-in-out'
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        simple: () => import('@iconify-json/simple-icons/icons.json').then(i => i.default)
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter Variable:400,500,600,700',
        mono: 'JetBrains Mono Variable:400,500,600',
        gaming: 'Orbitron Variable:400,500,600,700,800,900'
      }
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  safelist: [
    'i-lucide-gamepad-2',
    'i-lucide-star',
    'i-lucide-heart',
    'i-lucide-bookmark',
    'i-lucide-clock',
    'i-lucide-trophy',
    'i-mdi-steam',
    'i-mdi-microsoft-xbox',
    'i-mdi-sony-playstation',
    'i-mdi-nintendo-switch'
  ]
});