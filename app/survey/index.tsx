import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getUser } from "../../src/auth/session";
import { MoodKey, SURVEY } from "../../src/data/survey";
import { postJson } from "../../src/services/api.service";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";
import { pickMood } from "../../src/utils/score";

type SurveyAnswer = {
  question: string;
  answer: string;
  mood: MoodKey;
};

type AiMoodResponse = {
  ok: boolean;
  data?: {
    greeting?: string;
    mood?: string;
    secondaryMood?: string | null;
    confidence?: number;
    recommendedGenres?: string[];
    followUpQuestion?: string;
    shortReason?: string;
  };
};

function normalizeAiGenres(value?: string[]) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) =>
      String(item || "")
        .toLowerCase()
        .trim(),
    )
    .filter(Boolean);
}

function normalizeAiMood(value: string, fallback: MoodKey): MoodKey {
  const mood = String(value || "")
    .trim()
    .toLowerCase();

  const allowed: MoodKey[] = ["calm", "happy", "sad", "angry"];

  return allowed.includes(mood as MoodKey) ? (mood as MoodKey) : fallback;
}

function getSafeUserName(user: any) {
  const fromName = String(user?.name || "").trim();
  if (fromName) return fromName;

  const fromEmail = String(user?.email || "").trim();
  if (fromEmail.includes("@")) {
    return fromEmail.split("@")[0];
  }

  return "Usuario";
}

export default function SurveyRoute() {
  const total = SURVEY.length;

  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<MoodKey[]>([]);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");

  const q = SURVEY[index];

  const progressText = useMemo(() => `${index + 1} / ${total}`, [index, total]);
  const progress = useMemo(
    () => (total ? (index + 1) / total : 0),
    [index, total],
  );

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const user = await getUser();
        if (!alive) return;

        setUserName(getSafeUserName(user));
      } catch {
        if (!alive) return;
        setUserName("Usuario");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  function animateIn() {
    fade.setValue(0);
    slide.setValue(10);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 210,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 210,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function analyzeWithAI(
    nextVotes: MoodKey[],
    nextAnswers: SurveyAnswer[],
  ) {
    const fallbackMood = pickMood(nextVotes);

    try {
      const data = await postJson<AiMoodResponse>("/api/ai/analyze-mood", {
        name: userName,
        answers: nextAnswers.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
        lastMood: fallbackMood,
        recentGenres: [],
      });

      if (!data?.ok || !data?.data) {
        throw new Error("La IA no respondió correctamente");
      }

      const finalMood = normalizeAiMood(data.data.mood || "", fallbackMood);
      const genres = normalizeAiGenres(data.data.recommendedGenres);

      router.replace({
        pathname: "/recommendations",
        params: {
          mood: finalMood,
          greeting: data.data.greeting || "",
          secondaryMood: data.data.secondaryMood || "",
          confidence:
            typeof data.data.confidence === "number"
              ? String(data.data.confidence)
              : "",
          followUpQuestion: data.data.followUpQuestion || "",
          shortReason: data.data.shortReason || "",
          recommendedGenres: JSON.stringify(genres),
          source: "ai",
        },
      });
    } catch {
      router.replace({
        pathname: "/recommendations",
        params: {
          mood: fallbackMood,
          source: "fallback",
        },
      });
    }
  }

  async function nextStep(nextVotes: MoodKey[], nextAnswers: SurveyAnswer[]) {
    setSelectedId(null);

    if (index < total - 1) {
      setIndex((prev) => prev + 1);
      animateIn();
      return;
    }

    const fallbackMood = pickMood(nextVotes);

    router.push({
      pathname: "/recommendations",
      params: {
        mood: fallbackMood,
        source: "fast-local",
      },
    });

    setTimeout(() => {
      void analyzeWithAI(nextVotes, nextAnswers);
    }, 0);
  }

  function choose(optionId: string, mood: MoodKey, label: string) {
    if (selectedId) return;

    setSelectedId(optionId);

    const nextVotes = [...votes, mood];
    const nextAnswers = [
      ...answers,
      {
        question: q.title,
        answer: label,
        mood,
      },
    ];

    setVotes(nextVotes);
    setAnswers(nextAnswers);

    setTimeout(() => {
      void nextStep(nextVotes, nextAnswers);
    }, 160);
  }

  function back() {
    if (index === 0) {
      router.back();
      return;
    }

    setSelectedId(null);
    setIndex((prev) => prev - 1);
    setVotes((prev) => prev.slice(0, -1));
    setAnswers((prev) => prev.slice(0, -1));
    animateIn();
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />

      <AppHeader
        title="Encuesta"
        subtitle={`Responde rápido • ${progressText}`}
        showBack
        onBackPress={back}
      />

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fade,
            transform: [{ translateY: slide }],
          },
        ]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pregunta {index + 1}</Text>
        </View>

        <Text style={styles.question}>{q.title}</Text>

        <View style={styles.options}>
          {q.options.map((o) => {
            const selected = selectedId === o.id;

            return (
              <Pressable
                key={o.id}
                onPress={() => choose(o.id, o.mood, o.label)}
                android_ripple={{ color: "rgba(255,255,255,0.10)" }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && !selected && styles.optionPressed,
                ]}
              >
                <View style={styles.optionInner}>
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {o.label}
                  </Text>

                  <View style={styles.dotWrap}>
                    <View style={[styles.dot, selected && styles.dotActive]} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tipWrap}>
          <Text style={styles.tip}>
            Elige lo que más se parezca a tu estado actual. No hay respuestas
            correctas.
          </Text>
        </View>
      </Animated.View>
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
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(0,180,255,0.07)",
  },

  bgOrbBottom: {
    position: "absolute",
    right: -60,
    bottom: 40,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(24,120,255,0.06)",
  },

  progressWrap: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    opacity: 0.95,
  },

  progressText: {
    width: 48,
    textAlign: "right",
    color: theme.colors.textMuted,
    fontWeight: "900",
    fontSize: 12,
  },

  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 12,
  },

  badgeText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  question: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },

  options: {
    marginTop: 16,
    gap: 10,
  },

  option: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.md,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  optionPressed: {
    opacity: 0.9,
    transform: [{ scale: Platform.OS === "web" ? 1 : 0.99 }],
  },

  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(110,231,183,0.10)",
  },

  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  optionText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },

  optionTextSelected: {
    color: theme.colors.text,
    fontWeight: "900",
  },

  dotWrap: {
    width: 24,
    alignItems: "flex-end",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "transparent",
  },

  dotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  tipWrap: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },

  tip: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
