import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import {
  MovieDetailFull,
  moviesService,
} from "../../src/services/movies.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";

const IMG_1280 = "https://image.tmdb.org/t/p/w1280";
const IMG_500 = "https://image.tmdb.org/t/p/w500";

export default function MovieDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [movie, setMovie] = useState<MovieDetailFull | null>(null);
  const [loading, setLoading] = useState(true);

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

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
    const g = movie?.genres?.map((x) => x.name).slice(0, 4) ?? [];
    return g.length ? g.join(", ") : "—";
  }, [movie]);

  const runtimeText = useMemo(() => {
    const rt = movie?.runtime ?? null;
    if (!rt) return "—";
    const h = Math.floor(rt / 60);
    const m = rt % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [movie]);

  const trailerUrl = useMemo(() => {
    if (!trailerKey) return null;
    return `https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`;
  }, [trailerKey]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const data = await moviesService.getDetailFull(id);
        setMovie(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function openTrailer() {
    if (!id) return;

    if (!trailerKey) {
      try {
        setLoadingTrailer(true);
        const key = await moviesService.getTrailerKey(id);
        setTrailerKey(key);
      } finally {
        setLoadingTrailer(false);
      }
    }

    setTrailerOpen(true);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text }}>
          No se encontró la película
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="movie/[id]" subtitle={`${year} • ⭐ ${rating}`} />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.hero}>
          {backdrop ? (
            <Image source={{ uri: backdrop }} style={styles.heroBg} />
          ) : null}
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.posterWrap}>
              {poster ? (
                <Image source={{ uri: poster }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterFallback]}>
                  <Text style={{ color: theme.colors.textMuted }}>
                    Sin poster
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.title}>
                {movie.title} <Text style={styles.year}>({year})</Text>
              </Text>

              <Text style={styles.meta}>
                {genresText} • {runtimeText}
              </Text>

              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>⭐ {rating}</Text>
                </View>
                <View style={[styles.badge, styles.badgeGhost]}>
                  <Text style={styles.badgeGhostText}>TMDB</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.playBtn} onPress={openTrailer}>
                  <Text style={styles.playBtnText}>
                    {loadingTrailer ? "Cargando…" : "Reproducir tráiler"}
                  </Text>
                </Pressable>

                <Pressable style={styles.secondaryBtn} onPress={() => {}}>
                  <Text style={styles.secondaryBtnText}>Guardar</Text>
                </Pressable>
              </View>

              <Text style={styles.overviewTitle}>Resumen</Text>
              <Text style={styles.overview}>
                {movie.overview || "Sin descripción."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL TRAILER */}
      <Modal
        visible={trailerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTrailerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Tráiler</Text>
              <Pressable
                onPress={() => setTrailerOpen(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>X</Text>
              </Pressable>
            </View>

            {!trailerUrl ? (
              <View style={styles.modalCenter}>
                <Text style={styles.muted}>No hay tráiler disponible.</Text>
              </View>
            ) : (
              <View style={styles.videoWrap}>
                {Platform.OS === "web" ? (
                  <iframe
                    src={trailerUrl}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Trailer"
                  />
                ) : (
                  <WebView
                    source={{ uri: trailerUrl }}
                    style={{ flex: 1, backgroundColor: "#000" }}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsFullscreenVideo
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

const { width } = Dimensions.get("window");
const isWide = width >= 900;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  hero: { position: "relative", paddingTop: 10 },
  heroBg: { width: "100%", height: 420, position: "absolute", top: 0, left: 0 },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 420,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  heroContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 22,
    flexDirection: isWide ? "row" : "column",
    gap: 18,
  },

  posterWrap: {
    width: isWide ? 240 : "100%",
    alignItems: isWide ? "flex-start" : "center",
  },
  poster: {
    width: isWide ? 240 : 220,
    height: isWide ? 360 : 320,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },
  posterFallback: { alignItems: "center", justifyContent: "center" },

  info: { flex: 1, maxWidth: isWide ? 720 : 900 },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: "900" },
  year: { color: theme.colors.textMuted, fontWeight: "700" },
  meta: { color: theme.colors.textMuted, marginTop: 6 },

  badges: { flexDirection: "row", gap: 10, marginTop: 12 },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontWeight: "900" },
  badgeGhost: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  badgeGhostText: { color: theme.colors.text, fontWeight: "800" },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  playBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  playBtnText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  secondaryBtnText: { color: theme.colors.text, fontWeight: "800" },

  overviewTitle: {
    color: theme.colors.text,
    marginTop: 18,
    fontSize: 18,
    fontWeight: "900",
  },
  overview: { color: theme.colors.text, marginTop: 8, lineHeight: 20 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTop: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { color: theme.colors.text, fontWeight: "900" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  closeBtnText: { color: theme.colors.text, fontWeight: "900" },

  videoWrap: { width: "100%", height: 480, backgroundColor: "#000" },

  modalCenter: { height: 200, alignItems: "center", justifyContent: "center" },
  muted: { color: theme.colors.textMuted },
});
