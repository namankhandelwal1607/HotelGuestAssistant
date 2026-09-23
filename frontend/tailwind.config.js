/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        omago: {
          50: '#FAF8FE',
          100: '#F4EEFD',
          200: '#E9DFFB',
          300: '#D6C2F7',
          400: '#B794F6',
          500: '#9B66EB',
          600: '#8B5CF6', // vivid purple accent
          700: '#7C3AED', // primary accent
          800: '#6D28D9',
          900: '#4C1D95',
          dark: '#1A1824',
          surface: '#FAFAFC',
          lavender: '#E9DFFB',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f6',
          500: '#0e8ce6',
          600: '#026fc4',
          700: '#03589f',
          800: '#074b83',
          900: '#0c3f6e',
          950: '#082849'
        }
      },
      boxShadow: {
        'omago-card': '0 20px 50px -10px rgba(124, 58, 237, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'omago-glow': '0 0 70px 20px rgba(168, 85, 247, 0.28)',
        'omago-orb': '0 0 30px rgba(139, 92, 246, 0.5)',
        'omago-widget': '0 24px 64px -12px rgba(26, 24, 36, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        'omago-sm': '14px',
        'omago-md': '18px',
        'omago-lg': '22px',
        'omago-xl': '28px',
        'omago-pill': '9999px',
      }
    },
  },
  plugins: [],
}
