/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#FAFAFA',
          100: '#F4F4F4',
          200: '#E8E8E8',
          300: '#D1D1D1',
          400: '#9A9A9A',
          500: '#6B6B6B',
          600: '#3F3F3F',
          700: '#1F1F1F',
          900: '#0A0A0A',
        },
        ledger: {
          green: '#0D6E3A',
          red: '#B42318',
          amber: '#B54708',
        },
        paper: '#FBFAF7',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
