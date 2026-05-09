/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grape: { DEFAULT: '#4A1F8C', deep: '#2E0F5C' },
        plum: '#7B36C7',
        lavender: { DEFAULT: '#EFD9FF', mid: '#E1BFFF' },
        cream: '#FFF6E8',
        pink: '#EC3B8E',
        orange: '#F37A2B',
        lemon: '#F5CF3E',
        mint: '#6CD7C2',
        ink: '#2A0F4F',
      },
      fontFamily: {
        display: ['"Bagel Fat One"', 'Caprasimo', 'serif'],
        groove: ['Caprasimo', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '6px 6px 0 #4A1F8C',
        'card-hover': '9px 9px 0 #4A1F8C',
        btn: '4px 4px 0 #4A1F8C',
        'btn-hover': '6px 6px 0 #4A1F8C',
        'btn-nav': '3px 3px 0 #EC3B8E',
        'btn-nav-hover': '5px 5px 0 #EC3B8E',
      },
    },
  },
  plugins: [],
};
