import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getToken } from "@/src/auth/session";
import { theme } from "@/src/styles/theme";

export default function TabsLayout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await getToken();

        if (!alive) return;

        if (!token) {
          router.replace("/login" as any);
          return;
        }

        setChecking(false);
      } catch {
        if (!alive) return;
        router.replace("/login" as any);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}
