/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        hud: ['Space Mono', 'monospace'],
      },
      letterSpacing: {
        brutal: '-0.04em',
        hud: '0.08em',
      },
      colors: {
        command: {
          bg: '#07090E',
          card: 'rgba(11, 15, 25, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
          cyan: '#00F0FF',
          amber: '#FFB800',
          crimson: '#FF2E54',
          emerald: '#00FF9D',
        },
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(255, 46, 84, 0.9)', boxShadow: '0 0 25px rgba(255, 46, 84, 0.5)' },
          '50%': { borderColor: 'rgba(255, 46, 84, 0.3)', boxShadow: '0 0 10px rgba(255, 46, 84, 0.2)' },
        },
        blinkCursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-border': 'pulseBorder 1.5s infinite',
        'blink-cursor': 'blinkCursor 0.8s infinite',
      },
    },
  },
  plugins: [],
};
