import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Movie, moviesService } from "../../src/services/movies.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";

export default function ExploreRoute() {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await moviesService.getPopular();
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando películas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader title="Explore" subtitle="Populares en TMDB" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}> {error} </Text>
          <Text style={styles.muted}>
            Si es 401, tu token está mal o revocado.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          numColumns={3}
          keyExtractor={(m) => m.id}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/movie/${item.id}` as any)}
              style={styles.card}
            >
              {item.poster ? (
                <Image source={{ uri: item.poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.noPoster]}>
                  <Text style={styles.noPosterText}>No poster</Text>
                </View>
              )}
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: 10,
  },
  card: { width: "31.5%" },
  poster: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  noPoster: { alignItems: "center", justifyContent: "center" },
  noPosterText: { color: theme.colors.textMuted, fontSize: 12 },
  title: {
    color: theme.colors.text,
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  muted: { color: theme.colors.textMuted },
  error: {
    color: theme.colors.primary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
