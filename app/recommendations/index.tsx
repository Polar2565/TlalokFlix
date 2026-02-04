import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { MoodKey } from "../../src/data/survey";
import type { Movie } from "../../src/services/movies.service";
import { recommendationService } from "../../src/services/recommendation.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";
import PrimaryButton from "../../src/ui/PrimaryButton";
import { moodLabel } from "../../src/utils/score";

const { width } = Dimensions.get("window");

export default function RecommendationsRoute() {
  const { mood } = useLocalSearchParams<{ mood?: string }>();
  const moodKey = (mood as MoodKey) || "calm";

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(
    () => `Para cuando estás ${moodLabel(moodKey)}`,
    [moodKey],
  );

  // Carrusel: tamaño y “snap”
  const CARD_W = Math.min(420, Math.floor(width * 0.78));
  const GAP = 14;
  const SNAP = CARD_W + GAP;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await recommendationService.getForMood(moodKey);
        setItems(data.slice(0, 12));
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando recomendaciones");
      } finally {
        setLoading(false);
      }
    })();
  }, [moodKey]);

  return (
    <View style={styles.container}>
      <AppHeader title="Recomendaciones" subtitle={title} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Buscando películas…</Text>
        </View>
      ) : err ? (
        <View style={styles.center}>
          <Text style={styles.error}>{err}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(m) => m.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: 10,
            }}
            snapToInterval={SNAP}
            decelerationRate="fast"
            snapToAlignment="start"
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, { width: CARD_W }]}
                onPress={() => router.push(`/movie/${item.id}` as any)}
              >
                {item.poster ? (
                  <Image source={{ uri: item.poster }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.noPoster]}>
                    <Text style={styles.noPosterText}>No poster</Text>
                  </View>
                )}

                <View style={styles.meta}>
                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.sub}>
                    {item.year || "—"} • ⭐ {item.rating}
                  </Text>

                  <Text style={styles.overview} numberOfLines={3}>
                    {item.overview || "Sin descripción."}
                  </Text>

                  <PrimaryButton
                    label="Ver detalles"
                    onPress={() => router.push(`/movie/${item.id}` as any)}
                    style={{ marginTop: 12 }}
                  />
                </View>
              </Pressable>
            )}
          />

          <View style={styles.footer}>
            <PrimaryButton
              label="Volver al Home"
              variant="ghost"
              onPress={() => router.push("/(tabs)" as any)}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  muted: { color: theme.colors.textMuted },
  error: {
    color: theme.colors.primary,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  poster: {
    width: "100%",
    height: 260,
    backgroundColor: theme.colors.surface2,
  },
  noPoster: { alignItems: "center", justifyContent: "center" },
  noPosterText: { color: theme.colors.textMuted },

  meta: { padding: theme.spacing.md },
  movieTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "900" },
  sub: { color: theme.colors.textMuted, marginTop: 4 },
  overview: { color: theme.colors.text, marginTop: 10, lineHeight: 20 },

  footer: { padding: theme.spacing.lg, paddingTop: 12 },
});
