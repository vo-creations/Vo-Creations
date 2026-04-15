import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Agency theme (amber)
        bg: {
          DEFAULT: '#0F0D0B',
          card: '#1A1714',
          elevated: '#241F1A',
          subtle: '#0e0d0a',
        },
        accent: {
          DEFAULT: '#F5A623',
          light: '#f7c157',
          dim: 'rgba(245,166,35,0.15)',
          mid: 'rgba(245,166,35,0.25)',
          glow: 'rgba(245,166,35,0.3)',
        },
        text: {
          DEFAULT: '#F5EDE3',
          secondary: '#9A9088',
          dim: '#6b6558',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          accent: 'rgba(245,166,35,0.2)',
        },
        green: '#4ade80',
        red: '#f87171',

        // Mentorship theme (green)
        m: {
          bg: '#0a0a0a',
          card: '#111111',
          elevated: '#1a1a1a',
          subtle: '#0e0e0e',
          accent: '#5cff7e',
          'accent-dim': 'rgba(92,255,126,0.08)',
          'accent-mid': 'rgba(92,255,126,0.15)',
          'accent-glow': 'rgba(92,255,126,0.4)',
          cyan: '#5ce1ff',
          peach: '#ff9f68',
          text: '#f5f5f5',
          'text-secondary': '#9ca3af',
          'text-dim': '#555',
          border: 'rgba(255,255,255,0.06)',
          'border-accent': 'rgba(92,255,126,0.15)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        space: ['var(--font-space)', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-up-delay-1': 'fadeUp 0.7s ease 0.1s both',
        'fade-up-delay-2': 'fadeUp 0.7s ease 0.2s both',
        'fade-up-delay-3': 'fadeUp 0.7s ease 0.3s both',
        'fade-up-delay-4': 'fadeUp 0.7s ease 0.4s both',
        'fade-down': 'fadeDown 0.6s ease',
        pulse: 'pulse 2s ease infinite',
        scroll: 'scroll 35s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
