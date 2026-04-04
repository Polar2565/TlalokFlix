import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Movie, moviesService } from "../../src/services/movies.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";

const FAV_KEY = "tlalokflix:favorites:v1";

type StoredFavorite = {
  id: string;
  title?: string;
  poster?: string | null;
  savedAt?: number;
};

function normalizeStoredFavorites(input: unknown): StoredFavorite[] {
  if (!Array.isArray(input)) return [];

  const normalized = input
    .map((item): StoredFavorite | null => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          id: String(item).trim(),
          savedAt: 0,
        };
      }

      if (item && typeof item === "object" && "id" in item) {
        const raw = item as {
          id: string | number;
          title?: string;
          poster?: string | null;
          savedAt?: number;
        };

        return {
          id: String(raw.id).trim(),
          title: raw.title,
          poster: raw.poster ?? null,
          savedAt: Number(raw.savedAt || 0),
        };
      }

      return null;
    })
    .filter(Boolean) as StoredFavorite[];

  const seen = new Set<string>();
  const dedup: StoredFavorite[] = [];

  for (const item of normalized) {
    if (!item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    dedup.push(item);
  }

  return dedup.sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0));
}

async function getFavRaw(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis?.localStorage?.getItem(FAV_KEY) ?? null;
    } catch {
      return null;
    }
  }

  return await AsyncStorage.getItem(FAV_KEY);
}

async function setFavRaw(value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis?.localStorage?.setItem(FAV_KEY, value);
    } catch {}
    return;
  }

  await AsyncStorage.setItem(FAV_KEY, value);
}

export default function FavoritesRoute() {
  const [favoriteEntries, setFavoriteEntries] = useState<StoredFavorite[]>([]);
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalFavorites = useMemo(
    () => favoriteEntries.length,
    [favoriteEntries],
  );

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const raw = await getFavRaw();

      let parsed: unknown = [];
      try {
        parsed = raw ? JSON.parse(raw) : [];
      } catch {
        parsed = [];
      }

      const normalized = normalizeStoredFavorites(parsed);
      setFavoriteEntries(normalized);

      if (normalized.length === 0) {
        setItems([]);
        return;
      }

      const movies = await Promise.all(
        normalized.map(async (entry) => {
          try {
            const movie = await moviesService.getMovie(String(entry.id));
            return movie;
          } catch {
            return null;
          }
        }),
      );

      const validMovies = movies.filter(Boolean) as Movie[];

      const ordered = normalized
        .map((entry) =>
          validMovies.find((movie) => String(movie.id) === String(entry.id)),
        )
        .filter(Boolean) as Movie[];

      setItems(ordered);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "No se pudieron cargar tus favoritos";

      setError(msg);
      setFavoriteEntries([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  async function removeFavorite(id: string) {
    try {
      setRemovingId(id);

      const nextEntries = favoriteEntries.filter(
        (entry) => String(entry.id) !== String(id),
      );

      await setFavRaw(JSON.stringify(nextEntries));
      setFavoriteEntries(nextEntries);
      setItems((prev) =>
        prev.filter((movie) => String(movie.id) !== String(id)),
      );
    } catch {
      setError("No se pudo actualizar favoritos");
    } finally {
      setRemovingId(null);
    }
  }

  function renderHeader() {
    return (
      <View style={styles.headerBlock}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tus recomendaciones guardadas</Text>
          <Text style={styles.summaryText}>
            Guarda aquí las películas que te llamaron la atención para revisar
            su ficha o su tráiler después.
          </Text>

          <View style={styles.summaryChips}>
            <View style={styles.miniChip}>
              <Text style={styles.miniChipText}>Favoritos</Text>
            </View>

            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{totalFavorites}</Text>
            </View>

            <View style={styles.miniChip}>
              <Text style={styles.miniChipMuted}>Sin descargas</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />

      <AppHeader
        title="Favoritos"
        subtitle="Películas guardadas para revisar después"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.muted}>Cargando favoritos…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.muted}>
            Intenta nuevamente o revisa tu conexión.
          </Text>

          <Pressable style={styles.retryBtn} onPress={loadFavorites}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : totalFavorites === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyBadgeText}>☆</Text>
          </View>

          <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>

          <Text style={styles.mutedSmall}>
            Cuando una recomendación te interese, guárdala y aparecerá aquí para
            revisarla después.
          </Text>

          <Pressable
            style={styles.goExploreBtn}
            onPress={() => router.push("/(tabs)/explore" as any)}
          >
            <Text style={styles.goExploreText}>Ir a explorar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(m, i) => String(m.id ?? i)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/movie/${item.id}` as any)}
              style={styles.card}
            >
              <View style={styles.posterWrap}>
                {item.poster ? (
                  <Image source={{ uri: item.poster }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.noPoster]}>
                    <Text style={styles.noPosterText}>Sin imagen</Text>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.removeBtn,
                    removingId === String(item.id) && styles.removeBtnDisabled,
                  ]}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    removeFavorite(String(item.id));
                  }}
                  disabled={removingId === String(item.id)}
                >
                  <Text style={styles.removeBtnText}>
                    {removingId === String(item.id) ? "…" : "Quitar"}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={styles.meta} numberOfLines={1}>
                {item.year ? `${item.year}` : "Año no disponible"}
                {item.rating ? ` • ${item.rating.toFixed(1)}` : ""}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  bgOrbTop: {
    position: "absolute",
    top: -70,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.06)",
  },

  bgOrbBottom: {
    position: "absolute",
    right: -50,
    bottom: 40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(212,162,74,0.05)",
  },

  headerBlock: {
    marginBottom: 14,
  },

  summaryCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(8, 24, 32, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  summaryTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  summaryText: {
    color: theme.colors.textMuted,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
  },

  summaryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  miniChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  miniChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  miniChipMuted: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  countChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.10)",
    borderWidth: 1,
    borderColor: "rgba(37,199,193,0.18)",
  },

  countChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  muted: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 10,
  },

  mutedSmall: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 280,
    marginTop: 10,
  },

  emptyBadge: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,199,193,0.10)",
    borderWidth: 1,
    borderColor: "rgba(37,199,193,0.18)",
    marginBottom: 14,
  },

  emptyBadgeText: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: "900",
  },

  emptyTitle: {
    color: theme.colors.text,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
  },

  error: {
    color: theme.colors.primary,
    textAlign: "center",
    paddingHorizontal: 20,
    fontWeight: "800",
  },

  retryBtn: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },

  retryText: {
    color: theme.colors.text,
    fontWeight: "900",
  },

  goExploreBtn: {
    marginTop: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },

  goExploreText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: 6,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  card: {
    width: "48.2%",
  },

  posterWrap: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },

  poster: {
    width: "100%",
    height: 250,
    backgroundColor: theme.colors.surface,
  },

  noPoster: {
    alignItems: "center",
    justifyContent: "center",
  },

  noPosterText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  removeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(5,18,24,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  removeBtnDisabled: {
    opacity: 0.7,
  },

  removeBtnText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "900",
  },

  title: {
    color: theme.colors.text,
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    minHeight: 36,
  },

  meta: {
    color: theme.colors.textMuted,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});
