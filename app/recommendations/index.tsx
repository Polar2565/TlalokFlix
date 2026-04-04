import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FlatListProps, ViewToken, ViewabilityConfig } from "react-native";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MoodKey } from "../../src/data/survey";
import type { Movie } from "../../src/services/movies.service";
import { recommendationService } from "../../src/services/recommendation.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";
import MovieCard from "../../src/ui/MovieCard";
import PrimaryButton from "../../src/ui/PrimaryButton";
import { moodLabel } from "../../src/utils/score";

const { width: SCREEN_W } = Dimensions.get("window");

const AnimatedMovieList = Animated.FlatList as unknown as React.ComponentType<
  FlatListProps<Movie>
>;

type RenderItem = NonNullable<FlatListProps<Movie>["renderItem"]>;

function normalizeText(value: unknown) {
  return String(value || "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[{}<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasChinese(text: string) {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasWeirdAiContent(value: string) {
  const text = normalizeText(value);

  if (!text) return true;
  if (hasChinese(text)) return true;

  const suspiciousPatterns = [
    /placeholder/i,
    /your name/i,
    /tu name is/i,
    /undefined/i,
    /null/i,
    /action\b/i,
    /student/i,
    /physics/i,
    /mental effort/i,
    /dramática y llena de guía/i,
    /liena de guía/i,
    /¿qué te parece/i,
  ];

  return suspiciousPatterns.some((rx) => rx.test(text));
}

function cleanAiLine(value: unknown, fallback: string, maxLen: number) {
  const text = normalizeText(value);

  if (!text) return fallback;
  if (text.length > maxLen) return fallback;
  if (hasWeirdAiContent(text)) return fallback;

  return text;
}

function normalizeGenres(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " "),
    )
    .filter(Boolean)
    .filter((genre) => !hasWeirdAiContent(genre))
    .slice(0, 5);
}

function buildFallbackCopy(mood: MoodKey) {
  const label = moodLabel(mood);

  const greetingByMood: Record<MoodKey, string> = {
    calm: "Hoy vas más tranquilo",
    happy: "Traes buena vibra",
    sad: "Hoy estás más sensible",
    angry: "Vienes con mucha energía",
  };

  const reasonByMood: Record<MoodKey, string> = {
    calm: "Te dejé opciones ligeras o envolventes para este momento.",
    happy: "Aquí te van opciones con ritmo, humor o energía positiva.",
    sad: "Estas opciones acompañan mejor un mood más sensible.",
    angry: "Te pueden funcionar historias más intensas o dinámicas.",
  };

  const followUpByMood: Record<MoodKey, string> = {
    calm: "¿Quieres algo ligero o emotivo?",
    happy: "¿Quieres algo divertido o aventurero?",
    sad: "¿Algo cálido o reflexivo?",
    angry: "¿Algo intenso o más oscuro?",
  };

  return {
    greeting: greetingByMood[mood] || `Selección para cuando estás ${label}`,
    reason:
      reasonByMood[mood] ||
      "Estas recomendaciones se ajustan al estado que detectamos.",
    followUp: followUpByMood[mood] || "¿Prefieres algo ligero o con más fondo?",
  };
}

export default function RecommendationsRoute() {
  const params = useLocalSearchParams();

  const moodKey = (params.mood as MoodKey) || "calm";
  const source = String(params.source || "fallback");

  const fallbackCopy = useMemo(() => buildFallbackCopy(moodKey), [moodKey]);

  const greeting = useMemo(
    () => cleanAiLine(params.greeting, fallbackCopy.greeting, 42),
    [params.greeting, fallbackCopy.greeting],
  );

  const reason = useMemo(
    () => cleanAiLine(params.shortReason, fallbackCopy.reason, 110),
    [params.shortReason, fallbackCopy.reason],
  );

  const followUp = useMemo(
    () => cleanAiLine(params.followUpQuestion, fallbackCopy.followUp, 48),
    [params.followUpQuestion, fallbackCopy.followUp],
  );

  const preferredGenres = useMemo(() => {
    const raw = params.recommendedGenres;

    if (typeof raw !== "string" || !raw.trim()) {
      return [] as string[];
    }

    try {
      const parsed = JSON.parse(raw);
      return normalizeGenres(parsed);
    } catch {
      return [];
    }
  }, [params.recommendedGenres]);

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(
    () => `Selección para cuando estás ${moodLabel(moodKey)}`,
    [moodKey],
  );

  const CARD_W = Math.min(250, Math.floor(SCREEN_W * 0.66));
  const CARD_H = Math.floor(CARD_W * 1.5);
  const GAP = 16;
  const SNAP = CARD_W + GAP;
  const SIDE_PAD = Math.max(20, Math.floor((SCREEN_W - CARD_W) / 2));

  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    viewAreaCoveragePercentThreshold: 55,
  }).current;

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: ViewToken[] }) => {
      const first = info.viewableItems?.[0]?.index;
      if (typeof first === "number") {
        setActiveIndex(first);
      }
    },
  ).current;

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      let data = await recommendationService.getForMood(
        moodKey,
        preferredGenres,
      );

      let safeItems = Array.isArray(data) ? data.slice(0, 12) : [];

      if (safeItems.length === 0 && preferredGenres.length > 0) {
        data = await recommendationService.getForMood(moodKey, []);
        safeItems = Array.isArray(data) ? data.slice(0, 12) : [];
      }

      setItems(safeItems);
      setActiveIndex(0);
      scrollX.setValue(0);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Error cargando recomendaciones";

      setErr(msg);
      setItems([]);
      setActiveIndex(0);
      scrollX.setValue(0);
    } finally {
      setLoading(false);
    }
  }, [moodKey, preferredGenres, scrollX]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const renderItem: RenderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.94, 1, 0.94],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.58, 1, 0.58],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [14, 0, 14],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.cardWrap,
          {
            width: CARD_W,
            opacity,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <MovieCard
          title={item.title}
          poster={item.poster}
          height={CARD_H}
          onPress={() => router.push(`/movie/${item.id}` as any)}
        />
      </Animated.View>
    );
  };

  const showAiBox = source === "ai";

  return (
    <View style={styles.container}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbMid} />
      <View style={styles.bgOrbBottom} />

      <AppHeader
        title="Recomendaciones"
        subtitle={title}
        showBack
        onBackPress={() => router.replace("/(tabs)" as any)}
      />

      {showAiBox ? (
        <View style={styles.aiBox}>
          <Text style={styles.aiGreeting}>{greeting}</Text>
          <Text style={styles.aiText}>{reason}</Text>
          <Text style={styles.aiFollow}>{followUp}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.muted}>Buscando películas…</Text>
        </View>
      ) : err ? (
        <View style={styles.center}>
          <Text style={styles.error}>{err}</Text>

          <PrimaryButton
            label="Reintentar"
            onPress={loadRecommendations}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No encontré recomendaciones</Text>
          <Text style={styles.mutedSmall}>
            Intenta otra vez o cambia tu estado de ánimo.
          </Text>

          <PrimaryButton
            label="Volver a la encuesta"
            onPress={() => router.push("/survey" as any)}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : (
        <View style={styles.carouselSection}>
          <AnimatedMovieList
            data={items}
            keyExtractor={(m, i) => String(m.id ?? i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: SIDE_PAD },
            ]}
            snapToInterval={SNAP}
            decelerationRate="fast"
            snapToAlignment="start"
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            renderItem={renderItem}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
          />

          <View style={styles.dotsRow}>
            {items.map((_, i) => {
              const active = i === activeIndex;

              return (
                <View
                  key={String(i)}
                  style={[styles.dot, active && styles.dotActive]}
                />
              );
            })}
          </View>
        </View>
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
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(37,199,193,0.07)",
  },

  bgOrbMid: {
    position: "absolute",
    top: 220,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(212,162,74,0.05)",
  },

  bgOrbBottom: {
    position: "absolute",
    bottom: -20,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(18,124,133,0.06)",
  },

  aiBox: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: 2,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },

  aiGreeting: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 16,
  },

  aiText: {
    color: theme.colors.text,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: "700",
  },

  aiFollow: {
    color: theme.colors.textMuted,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 22,
  },

  muted: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontWeight: "700",
  },

  mutedSmall: {
    color: theme.colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 280,
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

  carouselSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 14,
  },

  list: {
    flexGrow: 0,
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: "flex-start",
  },

  cardWrap: {
    borderRadius: 26,
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 4,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  dotActive: {
    width: 20,
    backgroundColor: theme.colors.primary,
  },
});
