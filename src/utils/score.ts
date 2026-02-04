import type { MoodKey } from "../data/survey";

export function pickMood(votes: MoodKey[]): MoodKey {
  const count: Record<MoodKey, number> = {
    calm: 0,
    happy: 0,
    sad: 0,
    angry: 0,
  };
  for (const v of votes) count[v]++;

  let best: MoodKey = "calm";
  let bestScore = -1;

  (Object.keys(count) as MoodKey[]).forEach((k) => {
    if (count[k] > bestScore) {
      bestScore = count[k];
      best = k;
    }
  });

  return best;
}

export function moodLabel(mood: MoodKey) {
  switch (mood) {
    case "calm":
      return "Calmado";
    case "happy":
      return "Feliz";
    case "sad":
      return "Triste";
    case "angry":
      return "Intenso";
  }
}
