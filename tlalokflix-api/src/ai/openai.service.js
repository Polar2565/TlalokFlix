const OLLAMA_HOST = String(
  process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
).replace(/\/+$/, "");

const OLLAMA_URL = `${OLLAMA_HOST}/api/generate`;
const MODEL = String(process.env.OLLAMA_MODEL || "qwen2.5:3b").trim();
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 12000);

const HOME_FACTS = [
  "Dato cinéfilo: muchas escenas nocturnas clásicas se grababan de día.",
  "Dato cinéfilo: el cine mudo casi nunca se proyectaba en silencio total.",
  "Dato cinéfilo: el montaje puede cambiar por completo el ritmo de una escena.",
  "Dato cinéfilo: el sonido transformó para siempre la forma de contar historias.",
  "Dato cinéfilo: un buen póster puede definir la identidad de una película.",
  "Dato cinéfilo: la música suele guiar emociones incluso antes del diálogo.",
];

const MOOD_META = {
  calm: {
    label: "tranquilo",
    genres: ["Drama ligero", "Animación", "Aventura"],
    reason:
      "Te convienen historias suaves, cálidas o envolventes para este momento.",
    question: "¿Prefieres algo ligero o emotivo?",
  },
  happy: {
    label: "de buena vibra",
    genres: ["Comedia", "Animación", "Aventura"],
    reason:
      "Te pueden funcionar películas con ritmo, humor o una energía más positiva.",
    question: "¿Quieres algo divertido o aventurero?",
  },
  sad: {
    label: "más sensible",
    genres: ["Drama", "Romance", "Inspiracional"],
    reason:
      "Te vienen mejor historias que acompañen el momento sin sentirse vacías.",
    question: "¿Algo cálido o más reflexivo?",
  },
  angry: {
    label: "con mucha energía",
    genres: ["Acción", "Thriller", "Crimen"],
    reason:
      "Te pueden entrar mejor historias intensas, dinámicas o más catárticas.",
    question: "¿Algo intenso o más oscuro?",
  },
  anxious: {
    label: "algo inquieto",
    genres: ["Comedia", "Animación", "Feel good"],
    reason:
      "Aquí funcionan mejor opciones ligeras, claras o que no te saturen.",
    question: "¿Quieres algo suave o divertido?",
  },
  stressed: {
    label: "cargado",
    genres: ["Comedia", "Aventura", "Feel good"],
    reason: "Lo mejor ahora suele ser algo ágil, agradable y fácil de seguir.",
    question: "¿Algo ligero o escapista?",
  },
  tired: {
    label: "cansado",
    genres: ["Comedia ligera", "Animación", "Aventura suave"],
    reason: "Te convienen películas amables, simples de seguir y poco pesadas.",
    question: "¿Algo fácil de ver o tierno?",
  },
  romantic: {
    label: "romántico",
    genres: ["Romance", "Drama", "Comedia romántica"],
    reason:
      "Aquí encajan mejor historias cercanas, cálidas o con conexión emocional.",
    question: "¿Algo dulce o más intenso?",
  },
  motivated: {
    label: "motivado",
    genres: ["Inspiracional", "Aventura", "Deporte"],
    reason:
      "Te pueden funcionar historias con impulso, avance o sensación de logro.",
    question: "¿Algo épico o inspirador?",
  },
  neutral: {
    label: "en balance",
    genres: ["Comedia", "Drama", "Aventura"],
    reason:
      "Te dejé opciones versátiles para que encuentres algo que sí te entre bien.",
    question: "¿Algo ligero o con más fondo?",
  },
};

function normalizeAnswers(answers) {
  if (Array.isArray(answers)) {
    return answers
      .map((item, index) => {
        if (typeof item === "string") return `${index + 1}. ${item}`;

        if (item && typeof item === "object") {
          const question = String(item.question || `Pregunta ${index + 1}`);
          const answer = String(item.answer || "");
          return `${index + 1}. ${question}: ${answer}`;
        }

        return `${index + 1}. ${String(item)}`;
      })
      .join("\n");
  }

  if (answers && typeof answers === "object") {
    return Object.entries(answers)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("\n");
  }

  return String(answers || "");
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
  }
  return null;
}

function clampConfidence(value, fallback = 1) {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return Math.round(n * 100) / 100;
}

function normalizeMood(value) {
  const mood = String(value || "")
    .trim()
    .toLowerCase();

  const allowed = Object.keys(MOOD_META);

  if (allowed.includes(mood)) return mood;

  if (mood.includes("cans")) return "tired";
  if (mood.includes("estres")) return "stressed";
  if (mood.includes("ans")) return "anxious";
  if (mood.includes("fel")) return "happy";
  if (mood.includes("tris")) return "sad";
  if (mood.includes("enoj") || mood.includes("molest")) return "angry";
  if (mood.includes("tranq") || mood.includes("calm")) return "calm";
  if (mood.includes("rom")) return "romantic";
  if (mood.includes("motiv")) return "motivated";

  return "neutral";
}

function removeWeirdChars(value) {
  return String(value || "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[{}<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasChinese(text) {
  return /[\u4E00-\u9FFF]/.test(text);
}

function hasHardEnglish(text) {
  return /\b(action|series|student|physics|mental effort|your name|placeholder|this|too much)\b/i.test(
    text,
  );
}

function isCleanSpanishText(value, maxLen = 120) {
  const text = removeWeirdChars(value);

  if (!text) return false;
  if (text.length > maxLen) return false;
  if (hasChinese(text)) return false;
  if (hasHardEnglish(text)) return false;
  if (/undefined|null/i.test(text)) return false;
  if (/tu name is/i.test(text)) return false;

  return true;
}

function safeShortText(value, fallback, maxLen) {
  const text = removeWeirdChars(value);

  if (!isCleanSpanishText(text, maxLen)) {
    return fallback;
  }

  return text;
}

function hashString(value) {
  return String(value || "")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function pickHomeFact(name, hour) {
  const day = new Date().getDate();
  const index =
    (hashString(name) + Number(hour || 0) + day) % HOME_FACTS.length;
  return HOME_FACTS[index];
}

function buildHomeFallback(name, hour) {
  const safeName = String(name || "").trim();
  const greeting =
    hour < 12
      ? safeName
        ? `Buenos días, ${safeName}`
        : "Buenos días"
      : hour < 19
        ? safeName
          ? `Hola, ${safeName}`
          : "Hola"
        : safeName
          ? `Qué tal, ${safeName}`
          : "Qué tal";

  return {
    greeting,
    subtitle: "Dato cinéfilo",
    lead: pickHomeFact(safeName, hour),
  };
}

function sanitizeHomeGreeting(data, name, hour) {
  const fallback = buildHomeFallback(name, hour);

  return {
    greeting: safeShortText(data?.greeting, fallback.greeting, 28),
    subtitle: safeShortText(data?.subtitle, fallback.subtitle, 24),
    lead: fallback.lead,
  };
}

function sanitizeMoodAnalysis(data, name, mood) {
  const meta = MOOD_META[mood] || MOOD_META.neutral;

  return {
    greeting: safeShortText(
      data?.greeting,
      name ? `Hola, ${name}.` : "Hola.",
      36,
    ),
    mood,
    secondaryMood: null,
    confidence: clampConfidence(data?.confidence, 1),
    recommendedGenres: meta.genres,
    followUpQuestion: safeShortText(data?.followUpQuestion, meta.question, 48),
    shortReason: safeShortText(data?.shortReason, meta.reason, 90),
  };
}

async function callOllama({ system, prompt, schema, numPredict = 120 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        system,
        prompt,
        stream: false,
        format: schema,
        options: {
          temperature: 0.2,
          num_predict: numPredict,
        },
      }),
    });

    const rawText = await res.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new Error(
        data?.error || rawText || `Ollama respondió con estado ${res.status}`,
      );
    }

    const responseText = String(data?.response || "").trim();

    if (!responseText) {
      throw new Error("Ollama respondió vacío");
    }

    const parsed = extractJson(responseText);

    if (!parsed) {
      throw new Error(
        `Ollama no devolvió JSON válido: ${responseText.slice(0, 220)}`,
      );
    }

    return parsed;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Ollama excedió el tiempo límite de ${TIMEOUT_MS} ms`);
    }

    throw new Error(error?.message || "No se pudo conectar con Ollama");
  } finally {
    clearTimeout(timeout);
  }
}

async function analyzeMood({
  name = "Usuario",
  answers = [],
  lastMood = null,
  recentGenres = [],
} = {}) {
  const mood = normalizeMood(lastMood || "neutral");
  const meta = MOOD_META[mood] || MOOD_META.neutral;
  const answersText = normalizeAnswers(answers)
    .split("\n")
    .slice(0, 6)
    .join("\n");

  const system = `
Eres el copywriter breve de una app de películas.
Tu trabajo NO es clasificar emociones ni recomendar géneros.
La app ya decidió el mood del usuario.
Solo redacta texto corto, claro, natural y usable en interfaz.
Siempre en español.
No mezcles idiomas.
No uses markdown.
No inventes datos personales.
No uses tono psicológico, poético o exagerado.
`.trim();

  const prompt = `
Genera SOLO un JSON válido con esta estructura exacta:
{
  "greeting": "string",
  "shortReason": "string",
  "followUpQuestion": "string",
  "confidence": 1
}

Reglas:
- greeting: saludo corto, máximo 6 palabras.
- shortReason: una sola oración breve, máximo 16 palabras.
- shortReason debe sonar natural para alguien en mood "${mood}" (${meta.label}).
- followUpQuestion: una pregunta breve, máximo 7 palabras.
- confidence: usa 1.
- No cambies el mood.
- No sugieras géneros.
- No inventes contexto.

Datos:
Nombre: ${String(name || "Usuario").trim()}
Mood decidido por la app: ${mood}
Resumen de respuestas:
${answersText || "Sin respuestas"}
`.trim();

  const schema = {
    type: "object",
    properties: {
      greeting: { type: "string" },
      shortReason: { type: "string" },
      followUpQuestion: { type: "string" },
      confidence: { type: "number" },
    },
    required: ["greeting", "shortReason", "followUpQuestion", "confidence"],
    additionalProperties: false,
  };

  const parsed = await callOllama({
    system,
    prompt,
    schema,
    numPredict: 90,
  });

  return sanitizeMoodAnalysis(parsed, name, mood);
}

async function generateHomeGreeting({ name = "Usuario", hour = 12 } = {}) {
  const safeHour = Number.isFinite(Number(hour)) ? Number(hour) : 12;

  const system = `
Eres el copywriter breve de la pantalla principal de una app de películas.
Tu trabajo es saludar al usuario con naturalidad.
Siempre en español.
No uses markdown.
No uses emojis.
No inventes profesiones, estudios, historias personales o contexto extra.
No seas intenso, poético ni exagerado.
`.trim();

  const prompt = `
Genera SOLO un JSON válido con esta estructura exacta:
{
  "greeting": "string",
  "subtitle": "string"
}

Reglas:
- greeting: saludo corto con el nombre si cabe, máximo 6 palabras.
- subtitle: segunda línea breve, máximo 4 palabras.
- Debe sonar natural y limpio.
- No menciones encuesta, emociones ni recomendaciones.

Datos:
Nombre: ${String(name || "Usuario").trim()}
Hora actual: ${safeHour}
`.trim();

  const schema = {
    type: "object",
    properties: {
      greeting: { type: "string" },
      subtitle: { type: "string" },
    },
    required: ["greeting", "subtitle"],
    additionalProperties: false,
  };

  const parsed = await callOllama({
    system,
    prompt,
    schema,
    numPredict: 50,
  });

  return sanitizeHomeGreeting(parsed, name, safeHour);
}

module.exports = {
  analyzeMood,
  generateHomeGreeting,
};
