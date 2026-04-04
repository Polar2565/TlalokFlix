import { StyleSheet } from "react-native";
import { theme } from "../theme";

const c = theme.colors;

export const loginStyles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: c.bg,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 22,
    borderRadius: 18,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    color: c.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: c.textMuted,
    marginTop: 6,
  },
  label: {
    color: c.textMuted,
    marginBottom: 6,
  },
  input: {
    color: c.text,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: c.surface2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputLast: {
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: c.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  linksWrap: {
    marginTop: 16,
    gap: 10,
  },
  linkCenter: {
    alignItems: "center",
  },
  linkText: {
    color: c.textMuted,
  },
  linkStrong: {
    color: c.primary,
    fontWeight: "800",
  },
  legal: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    fontSize: 12,
    marginTop: 2,
  },
});
