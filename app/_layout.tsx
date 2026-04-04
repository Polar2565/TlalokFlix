import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import "react-native-reanimated";

import { getToken } from "@/src/auth/session";
import { theme } from "@/src/styles/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const pathname = usePathname();

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      dark: true,
      colors: {
        ...DarkTheme.colors,
        background: theme.colors.bg,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.borderSoft,
        primary: theme.colors.primary,
        notification: theme.colors.secondary,
      },
    }),
    [],
  );

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      try {
        const token = await Promise.race<string | null>([
          getToken(),
          new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
        ]);

        if (!alive) return;

        const isAuthRoute =
          pathname === "/" || pathname === "/login" || pathname === "/register";

        const isPublicRoute =
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/privacy-modal";

        if (token) {
          if (isAuthRoute) {
            router.replace("/(tabs)" as any);
          }
          return;
        }

        if (!isPublicRoute) {
          router.replace("/login" as any);
        }
      } catch {
        if (!alive) return;

        const isPublicRoute =
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/privacy-modal";

        if (!isPublicRoute) {
          router.replace("/login" as any);
        }
      }
    }

    checkSession();

    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="survey/index" />
        <Stack.Screen name="recommendations/index" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="modal" />

        <Stack.Screen
          name="privacy-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>

      <StatusBar style="light" />
    </ThemeProvider>
  );
}
