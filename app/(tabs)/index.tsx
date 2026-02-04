import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { homeStyles } from "../../src/styles/screens/home.styles";
import AppHeader from "../../src/ui/AppHeader";
import PrimaryButton from "../../src/ui/PrimaryButton";

export default function HomeRoute() {
  return (
    <View style={homeStyles.container}>
      <AppHeader
        title="TLÁLOCFLIX"
        subtitle="Recomendación de películas basada en tu estado emocional"
      />

      {/* Hero TLÁLOC */}
      <View style={homeStyles.hero}>
        <View style={homeStyles.ornamentsRow}>
          <View style={homeStyles.ornamentBlock} />
          <View style={homeStyles.ornamentBlock} />
          <View style={homeStyles.ornamentBlock} />
          <View style={homeStyles.ornamentBlock} />
        </View>

        <PrimaryButton
          label="Iniciar encuesta"
          onPress={() => router.push("/survey")}
        />

        <PrimaryButton
          label="Ver catálogo"
          variant="ghost"
          onPress={() => router.push("/(tabs)/explore")}
          style={homeStyles.gap}
        />
      </View>

      <View style={homeStyles.content}>
        {/* espacio para cards futuras: “Tu vibra hoy”, “Recomendación rápida”, etc. */}
      </View>
    </View>
  );
}
