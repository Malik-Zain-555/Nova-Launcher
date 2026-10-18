/**
 * Nova Dock 2.0 Design System Tokens
 * Pixel-perfect alignment with Windows 11 Fluent Design & Apple Dynamic Island physics.
 */

export const DesignTokens = {
  colors: {
    // Surface backdrops (Windows 11 Acrylic & Mica layers)
    surface: {
      dark: 'rgba(16, 17, 26, 0.82)',
      darkBorder: 'rgba(255, 255, 255, 0.11)',
      darkSubtle: 'rgba(255, 255, 255, 0.05)',
      darkSubtleHover: 'rgba(255, 255, 255, 0.09)',
      light: 'rgba(248, 249, 253, 0.86)',
      lightBorder: 'rgba(0, 0, 0, 0.08)',
      lightSubtle: 'rgba(0, 0, 0, 0.03)',
      lightSubtleHover: 'rgba(0, 0, 0, 0.06)'
    },
    // Typography contrast
    text: {
      primary: '#f8f8fc',
      secondary: '#a3a3be',
      muted: '#6c6c82',
      inverse: '#10111a'
    },
    // Fluent Accent palettes
    accents: {
      violet: { name: 'Cosmic Violet', hex: '#7c5cff', glow: 'rgba(124, 92, 255, 0.35)' },
      cyan: { name: 'Electric Cyan', hex: '#22d3ee', glow: 'rgba(34, 211, 238, 0.35)' },
      rose: { name: 'Neon Rose', hex: '#fb7185', glow: 'rgba(251, 113, 133, 0.35)' },
      green: { name: 'Emerald', hex: '#34d399', glow: 'rgba(52, 211, 153, 0.35)' },
      amber: { name: 'Solar Amber', hex: '#fbbf24', glow: 'rgba(251, 191, 36, 0.35)' },
      blue: { name: 'Fluent Blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.35)' }
    },
    // Semantic States
    status: {
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#60a5fa'
    }
  },

  radius: {
    compactPill: '24px',
    expandedIsland: '28px',
    card: '16px',
    button: '12px',
    chip: '8px',
    full: '9999px'
  },

  spacing: {
    grid: 4, // 4px micro-grid
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px'
  },

  blur: {
    acrylic: 'blur(32px) saturate(190%)',
    subtle: 'blur(16px)',
    none: 'none'
  },

  shadows: {
    islandCompact: '0 10px 30px -8px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.14) inset',
    islandExpanded: '0 24px 56px -12px rgba(0, 0, 0, 0.72), 0 0 1px 1px rgba(255, 255, 255, 0.16) inset',
    cardGlow: '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
    accentGlow: (hex: string) => `0 0 24px -4px ${hex}`
  },

  typography: {
    fontFamilies: {
      sans: '"Segoe UI Variable Display", "Segoe UI", Inter, -apple-system, sans-serif',
      mono: '"Cascadia Code", "Consolas", monospace'
    },
    sizes: {
      hero: '28px',
      title: '20px',
      body: '13px',
      caption: '11px',
      mini: '10px'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  motion: {
    // 60fps spring physics curve (Apple Dynamic Island spec)
    spring: {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      mass: 0.95
    },
    // Snappy hover transitions
    snappy: {
      duration: 0.16,
      ease: [0.16, 1, 0.3, 1]
    },
    // Morphing durations (ms)
    durations: {
      compactToExpanded: 280,
      expandedToCompact: 200,
      liveActivityMorph: 240,
      pageSwitch: 160
    },
    // Reduced motion accessibility fallback
    reducedMotion: {
      duration: 0.05,
      ease: 'linear'
    }
  }
} as const;

export type AccentKey = keyof typeof DesignTokens.colors.accents;
