/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        king: {
          /** Superfícies e texto secundário seguem CSS vars (tema claro/escuro). */
          black: 'rgb(var(--king-rgb-black) / <alpha-value>)',
          jet: 'rgb(var(--king-rgb-jet) / <alpha-value>)',
          coal: 'rgb(var(--king-rgb-coal) / <alpha-value>)',
          graphite: 'rgb(var(--king-rgb-graphite) / <alpha-value>)',
          ash: 'rgb(var(--king-rgb-ash) / <alpha-value>)',
          silver: 'rgb(var(--king-rgb-silver) / <alpha-value>)',
          /** Texto principal (corpo / títulos em fundos neutros). */
          fg: 'rgb(var(--king-rgb-fg) / <alpha-value>)',
          /** Tom claro fixo — texto sobre vermelho / acentos. */
          bone: '#f4f1ea',
          ivory: '#faf7f0',
          /** Texto sempre escuro (ex.: selects em fundo claro). */
          ink: '#0a0a0a',
          red: '#b91c1c',
          blood: '#8b0000',
          crimson: '#dc143c',
          glow: '#ff1f3d',
          gold: '#d4af37',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 20, 60, 0.22), 0 0 60px rgba(220, 20, 60, 0.08)',
        'glow-red-lg': '0 0 40px rgba(220, 20, 60, 0.28), 0 0 120px rgba(220, 20, 60, 0.1)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.35)',
        'inner-glow': 'inset 0 0 30px rgba(220, 20, 60, 0.1)',
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(circle at 50% 30%, rgba(220,20,60,0.09), transparent 60%)',
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'noise':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'scroll-indicator': 'scrollIndicator 2.2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(220,20,60,0.16)' },
          '50%': { boxShadow: '0 0 45px rgba(220,20,60,0.38)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scrollIndicator: {
          '0%': { transform: 'translateY(0)', opacity: 0 },
          '40%': { opacity: 1 },
          '100%': { transform: 'translateY(12px)', opacity: 0 },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        king: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
