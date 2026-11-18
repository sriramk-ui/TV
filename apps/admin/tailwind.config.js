/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F5F6F9',
        panel: '#FFFFFF',
        ink: '#181C26',
        muted: '#808796',
        line: '#EAECF1',
        blue: '#243D83',
        deep: '#111C3E',
        soft: '#EFF2FB',
        green: '#1B946D',
        red: '#C24B53',
        amber: '#BD7A1C',
        gold: '#D97706'
      },
      borderRadius: {
        'brand': '18px'
      },
      boxShadow: {
        'brand': '0 12px 36px rgba(29, 45, 85, 0.045)'
      }
    }
  },
  plugins: []
};
