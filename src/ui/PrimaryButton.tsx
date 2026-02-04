import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "../styles/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  style?: ViewStyle;
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" ? styles.textPrimary : styles.textGhost,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  primary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },

  ghost: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  text: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  textPrimary: {
    color: "#fff",
  },

  textGhost: {
    color: theme.colors.text,
  },
});
