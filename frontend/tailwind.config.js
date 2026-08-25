/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#05060f',
          800: '#080a18',
          700: '#0d1024',
        },
        neon: {
          purple: '#a855f7',
          pink: '#ec4899',
          blue: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'hype-gradient': 'linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(168, 85, 247, 0.55)',
        'glow-strong': '0 0 70px -10px rgba(236, 72, 153, 0.6)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
}
