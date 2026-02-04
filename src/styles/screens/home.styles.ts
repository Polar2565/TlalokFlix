import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  hero: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  ornamentsRow: {
    position: "absolute",
    top: -22,
    right: -12,
    opacity: 0.25,
    transform: [{ rotate: "12deg" }],
  },

  ornamentBlock: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    margin: 6,
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },

  gap: {
    marginTop: theme.spacing.sm,
  },
});
