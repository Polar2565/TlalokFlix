import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MoodKey, SURVEY } from "../../src/data/survey";
import { theme } from "../../src/styles/theme";
import AppHeader from "../../src/ui/AppHeader";
import PrimaryButton from "../../src/ui/PrimaryButton";
import { pickMood } from "../../src/utils/score";

export default function SurveyRoute() {
  const total = SURVEY.length;

  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<MoodKey[]>([]);

  const q = SURVEY[index];

  const progressText = useMemo(() => `${index + 1} / ${total}`, [index, total]);

  function choose(mood: MoodKey) {
    const nextVotes = [...votes, mood];
    setVotes(nextVotes);

    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const finalMood = pickMood(nextVotes);
      router.push(`/recommendations?mood=${finalMood}` as any);
    }
  }

  function back() {
    if (index === 0) return router.back();
    setIndex(index - 1);
    setVotes(votes.slice(0, -1));
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Encuesta"
        subtitle={`Responde rápido • ${progressText}`}
      />

      <View style={styles.card}>
        <Text style={styles.question}>{q.title}</Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          {q.options.map((o) => (
            <Pressable
              key={o.id}
              style={styles.option}
              onPress={() => choose(o.mood)}
            >
              <Text style={styles.optionText}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Atrás" variant="ghost" onPress={back} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  question: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  option: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionText: { color: theme.colors.text, fontWeight: "700" },
  footer: { marginTop: "auto", padding: theme.spacing.lg },
});
