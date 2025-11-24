/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'princeton-orange': '#E77500',
        'princeton-black': '#000000',
        'princeton-cream': '#F7F3E3',
        'princeton-gold': '#C19A17',
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
