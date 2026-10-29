/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Racing Sunset Palette (Mandatory Pure Black for Steel Gray & Shadow Black)
        golden: {
          DEFAULT: '#E6B23C',
          hover: '#D4A12B',
          light: '#FDF7EB',
          dark: '#B8881E',
          muted: '#F4E5BE',
        },
        sand: {
          DEFAULT: '#C7B394',
          light: '#F5EFE6',
          dark: '#A69272',
        },
        steel: {
          DEFAULT: '#000000',
          light: '#1F2226',
          dark: '#000000',
        },
        graphite: {
          DEFAULT: '#1F2226',
          hover: '#262A30',
          light: '#2E3339',
          dark: '#141618',
        },
        shadow: {
          DEFAULT: '#000000',
          black: '#000000',
          pure: '#000000',
        },
        black: {
          DEFAULT: '#000000',
          pure: '#000000',
          rich: '#08080A',
        },
        racing: {
          DEFAULT: '#B41E2D',
          hover: '#9E1926',
          light: '#FCEAEB',
          dark: '#7D131E',
        },
        ivory: {
          DEFAULT: '#F7F6F0',
          dark: '#ECE8DB',
          light: '#FDFDFC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          stone: '#E5E8E3',
          dark: '#1F2226',
          black: '#000000',
        },
        stone: {
          DEFAULT: '#E5E8E3',
          dark: '#CCD2C9',
          light: '#F1F3F0',
        },
        charcoal: {
          DEFAULT: '#303832',
          dark: '#1F2420',
          light: '#424D45',
        },
        txt: {
          primary: '#303832',
          secondary: '#68736B',
          muted: '#8B968E',
          inverted: '#FFFFFF',
          gold: '#E6B23C',
          black: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        'gold-glow': '0 0 0 2px rgba(230, 178, 60, 0.35)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
