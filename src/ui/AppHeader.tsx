import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },

  title: {
    color: theme.colors.primary,
    fontSize: theme.font.title + 6,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  subtitle: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontSize: theme.font.body,
    lineHeight: 20,
    maxWidth: 320,
  },

  divider: {
    marginTop: theme.spacing.md,
    height: 2,
    width: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    opacity: 0.7,
  },
});
