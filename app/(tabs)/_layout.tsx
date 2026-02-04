import { theme } from "@/src/styles/theme";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,

        tabBarStyle: {
          backgroundColor: theme.colors.nav ?? theme.colors.bg, // por si no existiera nav
          borderTopWidth: 0, // se ve más premium sin línea dura
          height: 74,
          paddingTop: 10,
          paddingBottom: 14,

          // look “floating”
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          borderRadius: 18,

          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontWeight: "900",
          fontSize: 12,
          letterSpacing: 0.4,
        },

        // mejora espaciado del contenido dentro del tab
        tabBarItemStyle: {
          borderRadius: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
        }}
      />
    </Tabs>
  );
}
