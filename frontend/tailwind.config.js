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
        display: ['var(--font-syne)', 'Syne', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Space Mono', 'monospace'],
        hud: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        brutal: '-0.04em',
        hud: '0.08em',
        widest: '0.15em',
      },
      colors: {
        command: {
          bg: '#07090E',
          card: 'rgba(11, 15, 25, 0.90)',
          border: 'rgba(255, 255, 255, 0.12)',
          cyan: '#00F0FF',
          amber: '#FFB800',
          crimson: '#FF2E54',
          emerald: '#00FF9D',
          muted: '#64748B',
        },
      },
      keyframes: {
        pulseAlert: {
          '0%, 100%': { borderColor: 'rgba(255, 46, 84, 0.95)', boxShadow: '0 0 25px rgba(255, 46, 84, 0.55)' },
          '50%': { borderColor: 'rgba(255, 46, 84, 0.35)', boxShadow: '0 0 10px rgba(255, 46, 84, 0.2)' },
        },
        pulseAmber: {
          '0%, 100%': { borderColor: 'rgba(255, 184, 0, 0.9)', boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)' },
          '50%': { borderColor: 'rgba(255, 184, 0, 0.3)', boxShadow: '0 0 8px rgba(255, 184, 0, 0.15)' },
        },
        blinkCursor: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shockwavePulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'pulse-alert': 'pulseAlert 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-amber': 'pulseAmber 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink-cursor': 'blinkCursor 0.8s infinite',
        'radar-sweep': 'radarSweep 6s linear infinite',
        'shockwave-pulse': 'shockwavePulse 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite',
      },
    },
  },
  plugins: [],
};
