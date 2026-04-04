import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  hero: {
    width: "100%",
    alignSelf: "center",
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 28,
    padding: theme.spacing.lg,
    backgroundColor: "rgba(8, 25, 35, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(49, 195, 201, 0.16)",
    overflow: "hidden",
    shadowColor: "#31c3c9",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  ornamentsRow: {
    position: "absolute",
    top: -20,
    right: -10,
    opacity: 0.22,
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
    paddingBottom: theme.spacing.xl,
  },

  gap: {
    marginTop: theme.spacing.sm,
  },
});
