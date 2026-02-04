import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../src/styles/theme";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Text style={styles.subtitle}>Pantalla modal básica (sin template).</Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Cerrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: { color: theme.colors.textMuted, marginBottom: 16 },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
