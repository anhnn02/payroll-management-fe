// Import constants
import { COLORS } from './src/constants/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: COLORS.PRIMARY,
        // Secondary
        secondary: COLORS.SECONDARY,
        // Accent
        accent: COLORS.ACCENT,
        // Status Colors
        success: COLORS.SUCCESS,
        danger: COLORS.DANGER,
        warning: COLORS.WARNING,
        info: COLORS.INFO,
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
