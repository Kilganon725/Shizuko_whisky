import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ember: '#C87533',
        ink: '#130904',
        brown: '#3B1F0E',
        gold: '#E8B547',
      },
      boxShadow: {
        soft: '0 30px 100px rgba(0, 0, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['ui-serif', 'Georgia', 'serif'],
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 22%), radial-gradient(circle at 80% 0%, rgba(232,181,71,0.11), transparent 18%), radial-gradient(circle at 50% 100%, rgba(59,31,14,0.5), transparent 36%)',
      },
    },
  },
  plugins: [],
} satisfies Config
