import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  MovieDetailFull,
  moviesService,
} from "../../src/services/movies.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";

const IMG_1280 = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";

const FAV_KEY = "tlalokflix:favorites:v1";

async function favGetRaw(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis?.localStorage?.getItem(FAV_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return await AsyncStorage.getItem(FAV_KEY);
}

async function favSetRaw(v: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      globalThis?.localStorage?.setItem(FAV_KEY, v);
    } catch {}
    return;
  }
  await AsyncStorage.setItem(FAV_KEY, v);
}

type FavItem = {
  id: string;
  title: string;
  poster: string | null;
  savedAt: number;
};

async function favGetAll(): Promise<FavItem[]> {
  const raw = await favGetRaw();
  if (!raw) return [];

  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function favIs(id: string): Promise<boolean> {
  const arr = await favGetAll();
  return arr.some((x) => x.id === String(id));
}

async function favToggle(item: {
  id: string;
  title: string;
  poster: string | null;
}): Promise<boolean> {
  const id = String(item.id);
  const arr = await favGetAll();
  const exists = arr.some((x) => x.id === id);

  let next: FavItem[];

  if (exists) {
    next = arr.filter((x) => x.id !== id);
    await favSetRaw(JSON.stringify(next));
    return false;
  }

  next = [
    {
      id,
      title: item.title,
      poster: item.poster ?? null,
      savedAt: Date.now(),
    },
    ...arr,
  ];

  await favSetRaw(JSON.stringify(next));
  return true;
}

export default function MovieDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: winW, height: winH } = useWindowDimensions();
  const isWide = winW >= 920;

  const [movie, setMovie] = useState<MovieDetailFull | null>(null);
  const [loading, setLoading] = useState(true);

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [isFav, setIsFav] = useState(false);

  const year = useMemo(() => {
    if (!movie?.release_date) return "—";
    return movie.release_date.slice(0, 4);
  }, [movie]);

  const rating = useMemo(() => {
    const v = movie?.vote_average ?? 0;
    return Math.round(v * 10) / 10;
  }, [movie]);

  const poster = useMemo(() => {
    if (!movie?.poster_path) return null;
    return `${IMG_500}${movie.poster_path}`;
  }, [movie]);

  const backdrop = useMemo(() => {
    if (!movie?.backdrop_path) return null;
    return `${IMG_1280}${movie.backdrop_path}`;
  }, [movie]);

  const genresText = useMemo(() => {
    const g = movie?.genres?.map((x) => x.name).slice(0, 5) ?? [];
    return g.length ? g.join(", ") : "Sin género disponible";
  }, [movie]);

  const runtimeText = useMemo(() => {
    const rt = movie?.runtime ?? null;
    if (!rt) return "Duración no disponible";

    const h = Math.floor(rt / 60);
    const m = rt % 60;

    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [movie]);

  const synopsis = useMemo(() => {
    const text = String(movie?.overview || "").trim();
    if (!text) return "Sin descripción disponible.";
    return text;
  }, [movie]);

  const trailerUrl = useMemo(() => {
    if (!trailerKey) return null;
    return `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }, [trailerKey]);

  const videoWidth = useMemo(() => {
    return Math.min(920, Math.max(320, winW - 32));
  }, [winW]);

  const videoHeight = useMemo(() => {
    const h16_9 = Math.round(videoWidth * 0.5625);
    const maxH = Math.round(winH * 0.62);
    return Math.min(h16_9, maxH);
  }, [videoWidth, winH]);

  const modalMaxWidth = useMemo(() => {
    return Math.min(920, Math.max(320, winW - 32));
  }, [winW]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const data = await moviesService.getDetailFull(id);
        setMovie(data);

        const fav = await favIs(String(id));
        setIsFav(fav);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function openTrailer() {
    if (!id) return;

    try {
      setLoadingTrailer(true);

      let key = trailerKey;

      if (!key) {
        key = await moviesService.getTrailerKey(id);
        setTrailerKey(key);
      }

      if (!key) {
        Alert.alert("Tráiler", "No hay tráiler disponible para esta película.");
        return;
      }

      setPlaying(true);
      setTrailerOpen(true);
    } catch {
      Alert.alert("Tráiler", "No se pudo cargar el tráiler.");
    } finally {
      setLoadingTrailer(false);
    }
  }

  function closeTrailer() {
    setPlaying(false);
    setTrailerOpen(false);
  }

  async function onToggleFavorite() {
    if (!movie) return;

    try {
      const next = await favToggle({
        id: String(movie.id),
        title: movie.title,
        poster,
      });

      setIsFav(next);
      Alert.alert(
        "Favoritos",
        next ? "Guardada en favoritos" : "Quitada de favoritos",
      );
    } catch {
      Alert.alert("Favoritos", "No se pudo guardar. Intenta de nuevo.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando ficha…</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>No se encontró la película</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Detalle"
        subtitle="Ficha y tráiler"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {backdrop ? (
            <Image source={{ uri: backdrop }} style={styles.heroBg} />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroOverlay} />
          <View style={styles.heroGlow} />
        </View>

        <View style={styles.contentWrap}>
          <View style={[styles.mainCard, isWide && styles.mainCardWide]}>
            <View
              style={[styles.posterColumn, isWide && styles.posterColumnWide]}
            >
              {poster ? (
                <Image source={{ uri: poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterFallback]}>
                  <Text style={styles.posterFallbackText}>Sin poster</Text>
                </View>
              )}
            </View>

            <View style={[styles.infoColumn, isWide && styles.infoColumnWide]}>
              <View style={styles.topMetaRow}>
                <View style={styles.typeChip}>
                  <Text style={styles.typeChipText}>Ficha</Text>
                </View>

                <View style={styles.ratingChip}>
                  <Text style={styles.ratingChipText}>⭐ {rating}</Text>
                </View>
              </View>

              <Text style={styles.title}>{movie.title}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{year}</Text>
                </View>

                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{runtimeText}</Text>
                </View>
              </View>

              <Text style={styles.genreLine}>{genresText}</Text>

              <Text style={styles.synopsisText}>{synopsis}</Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={openTrailer}
                >
                  <Text style={styles.primaryBtnText}>
                    {loadingTrailer ? "Cargando…" : "Ver tráiler"}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    isFav && styles.secondaryBtnActive,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={onToggleFavorite}
                >
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      isFav && styles.secondaryBtnTextActive,
                    ]}
                  >
                    {isFav ? "En favoritos" : "Guardar"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.inlineInfoBar}>
                <Text style={styles.inlineInfoText}>
                  Revisa la ficha y el tráiler antes de decidir.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={trailerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeTrailer}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: modalMaxWidth }]}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalTitle}>Tráiler</Text>
                <Text style={styles.modalSubtitle}>{movie.title}</Text>
              </View>

              <Pressable onPress={closeTrailer} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>×</Text>
              </Pressable>
            </View>

            {!trailerKey ? (
              <View style={styles.modalCenter}>
                <Text style={styles.muted}>No hay tráiler disponible.</Text>
              </View>
            ) : (
              <View style={[styles.videoWrap, { height: videoHeight }]}>
                {Platform.OS === "web" ? (
                  <iframe
                    src={trailerUrl || ""}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Trailer"
                  />
                ) : (
                  <YoutubePlayer
                    height={videoHeight}
                    width={videoWidth}
                    play={playing}
                    videoId={trailerKey}
                    onChangeState={(state: string) => {
                      if (state === "ended") {
                        setPlaying(false);
                      }
                    }}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 24,
  },

  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 10,
    fontWeight: "700",
  },

  notFoundText: {
    color: theme.colors.text,
    fontWeight: "800",
  },

  scrollContent: {
    paddingBottom: 36,
  },

  hero: {
    position: "relative",
    height: 280,
    overflow: "hidden",
  },

  heroBg: {
    width: "100%",
    height: "100%",
  },

  heroFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface2,
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.68)",
  },

  heroGlow: {
    position: "absolute",
    right: -70,
    top: 40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.10)",
  },

  contentWrap: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -72,
  },

  mainCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 24, 32, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  mainCardWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  posterColumn: {
    alignItems: "center",
  },

  posterColumnWide: {
    width: 250,
    marginRight: 20,
    alignItems: "flex-start",
  },

  poster: {
    width: 220,
    height: 320,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
  },

  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  posterFallbackText: {
    color: theme.colors.textMuted,
    fontWeight: "700",
  },

  infoColumn: {
    marginTop: 18,
  },

  infoColumnWide: {
    flex: 1,
    marginTop: 0,
  },

  topMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  typeChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  ratingChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.14)",
    borderWidth: 1,
    borderColor: "rgba(37,199,193,0.18)",
  },

  ratingChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  title: {
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 14,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  metaChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  metaChipText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },

  genreLine: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  synopsisText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },

  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },

  primaryBtn: {
    minWidth: 148,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginRight: 10,
    marginBottom: 10,
  },

  primaryBtnText: {
    color: "#f7ffff",
    fontWeight: "900",
    textAlign: "center",
  },

  secondaryBtn: {
    minWidth: 126,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },

  secondaryBtnActive: {
    backgroundColor: "rgba(37,199,193,0.12)",
    borderColor: "rgba(37,199,193,0.22)",
  },

  secondaryBtnText: {
    color: theme.colors.text,
    fontWeight: "800",
    textAlign: "center",
  },

  secondaryBtnTextActive: {
    color: theme.colors.primary,
    fontWeight: "900",
  },

  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },

  inlineInfoBar: {
    marginTop: 6,
    paddingTop: 6,
  },

  inlineInfoText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  modalCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  modalTop: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 15,
  },

  modalSubtitle: {
    color: theme.colors.textMuted,
    marginTop: 3,
    fontSize: 12,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  closeBtnText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 20,
  },

  videoWrap: {
    width: "100%",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCenter: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },

  muted: {
    color: theme.colors.textMuted,
  },
});
