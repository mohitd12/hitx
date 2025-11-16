const config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ubuntu)', 'ui-sans-serif', 'system-ui'],
      }
    }
  },
  plugins: []
}

export default config;