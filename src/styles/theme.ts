export const theme = {
  colors: {
    // Fondos base
    bg: "#051218",
    bgSoft: "#081820",
    surface: "#0B1F27",
    surface2: "#12303A",
    surface3: "#173B46",
    nav: "#061016",

    // Texto
    text: "#F4F1E6",
    textSoft: "#D8E2DD",
    textMuted: "#9FB1AE",
    textDim: "#7E918D",

    // Marca / identidad
    primary: "#25C7C1",
    primaryDark: "#127C85",
    primarySoft: "rgba(37,199,193,0.14)",
    primaryGlow: "rgba(37,199,193,0.22)",

    // Decorativos
    secondary: "#D4A24A",
    secondarySoft: "rgba(212,162,74,0.16)",
    accent: "#8A5A2B",
    accentSoft: "#5E7F73",

    // UI utilitarios
    whiteSoft: "rgba(255,255,255,0.06)",
    whiteMute: "rgba(255,255,255,0.10)",
    glass: "rgba(255,255,255,0.04)",
    overlay: "rgba(0,0,0,0.42)",
    overlaySoft: "rgba(0,0,0,0.22)",

    // Bordes
    border: "rgba(212,162,74,0.16)",
    borderSoft: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",

    // Estados
    success: "#55D6A3",
    warning: "#F3C969",
    danger: "#FF6B7D",
    info: "#7DD3FC",

    // Extras visuales
    glow: "rgba(37,199,193,0.18)",
    shadow: "rgba(0,0,0,0.28)",
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 30,
    pill: 999,
  },

  spacing: {
    xxs: 4,
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 52,
  },

  font: {
    display: 32,
    title: 28,
    h1: 22,
    h2: 18,
    body: 14,
    bodyLg: 16,
    small: 12,
    tiny: 11,
  },

  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },

    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },

    glow: {
      shadowColor: "#25C7C1",
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
} as const;
