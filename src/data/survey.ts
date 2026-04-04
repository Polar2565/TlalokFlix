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
    title: "¿Cómo describirías tu energía ahora mismo?",
    options: [
      { id: "q1o1", label: "Baja y tranquila", mood: "calm" },
      { id: "q1o2", label: "Alta y positiva", mood: "happy" },
      { id: "q1o3", label: "Baja y pesada", mood: "sad" },
      { id: "q1o4", label: "Alta pero tensa", mood: "angry" },
    ],
  },
  {
    id: "q2",
    title: "¿Qué emoción se acerca más a tu día?",
    options: [
      { id: "q2o1", label: "Serenidad", mood: "calm" },
      { id: "q2o2", label: "Entusiasmo", mood: "happy" },
      { id: "q2o3", label: "Melancolía", mood: "sad" },
      { id: "q2o4", label: "Frustración", mood: "angry" },
    ],
  },
  {
    id: "q3",
    title: "¿Qué necesitas emocionalmente?",
    options: [
      { id: "q3o1", label: "Paz mental", mood: "calm" },
      { id: "q3o2", label: "Diversión y ligereza", mood: "happy" },
      { id: "q3o3", label: "Catarsis emocional", mood: "sad" },
      { id: "q3o4", label: "Descargar tensión", mood: "angry" },
    ],
  },
  {
    id: "q4",
    title: "¿Qué tipo de ritmo te atrae hoy?",
    options: [
      { id: "q4o1", label: "Suave y contemplativo", mood: "calm" },
      { id: "q4o2", label: "Dinámico y entretenido", mood: "happy" },
      { id: "q4o3", label: "Profundo y reflexivo", mood: "sad" },
      { id: "q4o4", label: "Rápido e intenso", mood: "angry" },
    ],
  },
  {
    id: "q5",
    title: "¿Cómo estuvo tu semana?",
    options: [
      { id: "q5o1", label: "Estable y tranquila", mood: "calm" },
      { id: "q5o2", label: "Productiva y motivadora", mood: "happy" },
      { id: "q5o3", label: "Agotadora emocionalmente", mood: "sad" },
      { id: "q5o4", label: "Estresante y caótica", mood: "angry" },
    ],
  },
  {
    id: "q6",
    title: "¿Qué quieres sentir al terminar la película?",
    options: [
      { id: "q6o1", label: "Equilibrado", mood: "calm" },
      { id: "q6o2", label: "Con una sonrisa", mood: "happy" },
      { id: "q6o3", label: "Conmovido", mood: "sad" },
      { id: "q6o4", label: "Liberado", mood: "angry" },
    ],
  },
  {
    id: "q7",
    title: "Si tu estado fuera un clima sería…",
    options: [
      { id: "q7o1", label: "Cielo despejado", mood: "calm" },
      { id: "q7o2", label: "Día soleado", mood: "happy" },
      { id: "q7o3", label: "Nublado", mood: "sad" },
      { id: "q7o4", label: "Tormenta eléctrica", mood: "angry" },
    ],
  },
];
