import type { MoodKey } from "../data/survey";

type MoodScore = {
  mood: MoodKey;
  score: number;
};

const MOODS: MoodKey[] = ["calm", "happy", "sad", "angry"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeIntensity(
  votes: MoodKey[],
  topMood: MoodKey,
  scores: Record<MoodKey, number>,
) {
  const totalScore = MOODS.reduce((acc, k) => acc + scores[k], 0);
  const topScore = scores[topMood];
  const secondScore = Math.max(
    ...MOODS.filter((m) => m !== topMood).map((m) => scores[m]),
  );

  const dominance = totalScore > 0 ? topScore / totalScore : 0;
  const margin = totalScore > 0 ? (topScore - secondScore) / totalScore : 0;

  const lastN = votes.slice(-3);
  const consistency = lastN.length
    ? lastN.filter((v) => v === topMood).length / lastN.length
    : 0;

  return clamp(0.45 * dominance + 0.35 * margin + 0.2 * consistency, 0, 1);
}

function tieBreak(a: MoodKey, b: MoodKey, last: MoodKey) {
  if (last === a) return a;
  if (last === b) return b;

  if ((a === "sad" && b === "calm") || (a === "calm" && b === "sad")) {
    return "sad";
  }

  if ((a === "angry" && b === "happy") || (a === "happy" && b === "angry")) {
    return "angry";
  }

  if ((a === "happy" && b === "calm") || (a === "calm" && b === "happy")) {
    return "happy";
  }

  return a;
}

export function pickMood(votes: MoodKey[]): MoodKey {
  if (!votes.length) return "calm";

  const scores: Record<MoodKey, number> = {
    calm: 0,
    happy: 0,
    sad: 0,
    angry: 0,
  };

  votes.forEach((mood, index) => {
    const weight = index + 1;
    scores[mood] += weight;
  });

  const results: MoodScore[] = MOODS.map((mood) => ({
    mood,
    score: scores[mood],
  })).sort((a, b) => b.score - a.score);

  const top = results[0];
  const second = results[1];
  const last = votes[votes.length - 1];

  if (second && top.score === second.score) {
    return tieBreak(top.mood, second.mood, last);
  }

  if (second && Math.abs(top.score - second.score) <= 2) {
    const intensity = computeIntensity(votes, top.mood, scores);

    if (intensity < 0.52) {
      return tieBreak(top.mood, second.mood, last);
    }

    return top.mood;
  }

  return top.mood;
}

export function moodLabel(mood: MoodKey) {
  switch (mood) {
    case "calm":
      return "tranquilo";
    case "happy":
      return "de buena vibra";
    case "sad":
      return "más sensible";
    case "angry":
      return "con mucha energía";
    default:
      return "tranquilo";
  }
}
