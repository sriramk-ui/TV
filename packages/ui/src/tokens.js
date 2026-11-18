/**
 * Design Tokens for Sri Sankara TV Production Portal.
 * Premium corporate theme: Deep Navy, Soft Grey Surfaces, Restrained Blue/Teal & Subtle Gold.
 */

const colors = {
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
  gold: '#D97706',
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  }
};

const shadows = {
  card: '0 12px 36px rgba(29, 45, 85, 0.045)',
  dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  modal: '0 25px 50px -12px rgba(17, 28, 62, 0.25)'
};

const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  full: '9999px'
};

const typography = {
  fontFamily: {
    sans: ['Inter', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
  }
};

module.exports = {
  colors,
  shadows,
  radius,
  typography
};
