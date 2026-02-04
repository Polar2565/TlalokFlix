export type MoodKey = "calm" | "happy" | "sad" | "angry";

export type SurveyOption = {
  id: string;
  label: string;
  mood: MoodKey;
};

export type SurveyQuestion = {
  id: string;
  title: string;
  options: SurveyOption[];
};

export const SURVEY: SurveyQuestion[] = [
  {
    id: "q1",
    title: "¿Cómo te sientes hoy?",
    options: [
      { id: "q1o1", label: "Tranquilo / en paz", mood: "calm" },
      { id: "q1o2", label: "Feliz / con energía", mood: "happy" },
      { id: "q1o3", label: "Triste / bajoneado", mood: "sad" },
      { id: "q1o4", label: "Enojado / estresado", mood: "angry" },
    ],
  },
  {
    id: "q2",
    title: "¿Qué tipo de historia te late ahorita?",
    options: [
      { id: "q2o1", label: "Relajante y ligera", mood: "calm" },
      { id: "q2o2", label: "Divertida y rápida", mood: "happy" },
      { id: "q2o3", label: "Emotiva", mood: "sad" },
      { id: "q2o4", label: "Intensa", mood: "angry" },
    ],
  },
  {
    id: "q3",
    title: "¿Qué ritmo prefieres?",
    options: [
      { id: "q3o1", label: "Lento / chill", mood: "calm" },
      { id: "q3o2", label: "Rápido / entretenido", mood: "happy" },
      { id: "q3o3", label: "Moderado / reflexivo", mood: "sad" },
      { id: "q3o4", label: "A tope / adrenalina", mood: "angry" },
    ],
  },
];
