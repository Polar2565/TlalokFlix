import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../styles/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(255,255,255,0.12)" }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <>
          <View style={styles.primaryGlowTop} pointerEvents="none" />
          <View style={styles.primaryGlowBottom} pointerEvents="none" />
          <View style={styles.primaryHighlight} pointerEvents="none" />
        </>
      ) : (
        <View style={styles.ghostHighlight} pointerEvents="none" />
      )}

      <Text
        style={[
          styles.text,
          isPrimary ? styles.textPrimary : styles.textGhost,
          disabled && styles.textDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    minHeight: 62,
    paddingVertical: 17,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  ghost: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  primaryGlowTop: {
    position: "absolute",
    top: -10,
    left: "8%",
    right: "8%",
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  primaryGlowBottom: {
    position: "absolute",
    bottom: -4,
    left: 10,
    right: 10,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  primaryHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "52%",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  ghostHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },

  disabled: {
    opacity: 0.58,
  },

  text: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  textPrimary: {
    color: "#f7ffff",
  },

  textGhost: {
    color: theme.colors.text,
  },

  textDisabled: {
    opacity: 0.9,
  },
});
