module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  theme: {
    screens: { mid: '800px' },
    extend: {
      zIndex: {
        1000: '1000',
      },
    },
  },
};
