import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Assistant', 'sans-serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#FAF8F4',
          50: '#FFFDF9',
          100: '#FAF8F4',
          200: '#F0EBE0',
        },
        sand: {
          DEFAULT: '#E8E0D0',
          100: '#E8E0D0',
          200: '#D4C8B4',
          300: '#C4B89A',
        },
        taupe: {
          DEFAULT: '#8C7B65',
          light: '#A09080',
          dark: '#6A5A48',
        },
        espresso: '#3D2F20',
        charcoal: '#1E1A16',
        gold: {
          DEFAULT: '#C9A96E',
          light: '#E8D5B0',
          deep: '#A07840',
        },
        sage: '#7A8C72',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config
