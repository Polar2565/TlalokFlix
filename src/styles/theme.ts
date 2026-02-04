export const theme = {
  colors: {
    // Fondos
    bg: "#0B1220", // azul noche
    surface: "#0F1A2B", // cards
    surface2: "#14223A", // elevaciones
    nav: "#08121E",

    // Texto
    text: "#EAF6FF",
    textMuted: "#9FB3C8",

    // Primario TLÁLOC (azul)
    primary: "#0EA5E9",
    primaryDark: "#0369A1",

    // Bordes
    border: "rgba(255,255,255,0.10)",
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999,
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },

  font: {
    title: 28,
    h1: 22,
    body: 14,
    small: 12,
  },
} as const;
