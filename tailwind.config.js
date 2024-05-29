
const { designTokens } = require('@a-little-world/little-world-design-system');
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  theme: {
    screens: 
     { mid: '800px' },
  }
};
