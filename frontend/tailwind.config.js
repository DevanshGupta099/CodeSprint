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
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '28px',
        'pill': '9999px',
      },
      colors: {
        canvas: '#F6F7F9',
        cobalt: {
          500: '#2563EB',
          600: '#1D4ED8',
        },
        azure: {
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        coral: {
          500: '#F43F5E',
          600: '#E11D48',
        },
        tangerine: {
          500: '#FB923C',
          600: '#F97316',
        },
      },
      boxShadow: {
        'zentra-card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 40px -4px rgba(0, 0, 0, 0.04)',
        'zentra-hover': '0 8px 16px -2px rgba(0, 0, 0, 0.03), 0 24px 48px -4px rgba(0, 0, 0, 0.06)',
        'zentra-tooltip': '0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'pill-tactile': '0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
};
