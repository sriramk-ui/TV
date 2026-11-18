const { colors, shadows, radius, typography } = require('@sankara/ui');

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          bg: colors.bg,
          panel: colors.panel,
          ink: colors.ink,
          muted: colors.muted,
          line: colors.line,
          blue: colors.blue,
          deep: colors.deep,
          soft: colors.soft,
          green: colors.green,
          red: colors.red,
          amber: colors.amber,
          gold: colors.gold,
          ...colors.slate
        }
      },
      boxShadow: {
        card: shadows.card,
        dropdown: shadows.dropdown,
        modal: shadows.modal
      },
      borderRadius: {
        'brand-sm': radius.sm,
        'brand-md': radius.md,
        'brand-lg': radius.lg,
        'brand-xl': radius.xl
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono
      }
    }
  }
};
