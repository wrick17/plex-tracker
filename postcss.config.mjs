export default {
  plugins: {
    '@tailwindcss/postcss': {
      darkMode: ['variant', [
        '@media (prefers-color-scheme: dark) { &:where(:not(.light), :not(.light *))',
        '&:where(.dark, .dark *)'
      ]]
    },
  },
};