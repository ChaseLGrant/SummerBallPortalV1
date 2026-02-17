import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7dc2fc',
          400: '#38a3f8',
          500: '#0e87e9',
          600: '#0269c7',
          700: '#0354a1',
          800: '#074885',
          900: '#0c3d6e',
          950: '#082749',
        },
        sand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6ddd0',
          300: '#d5c5b0',
          400: '#c2a88e',
          500: '#b49375',
          600: '#a78068',
          700: '#8b6957',
          800: '#72574a',
          900: '#5d4940',
        },
        field: {
          50: '#f0fdf0',
          100: '#dcfcdc',
          200: '#bbf7bc',
          300: '#86ef89',
          400: '#4ade50',
          500: '#22c529',
          600: '#16a31d',
          700: '#15801b',
          800: '#16651b',
          900: '#145319',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
