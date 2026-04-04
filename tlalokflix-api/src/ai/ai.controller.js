const { analyzeMood, generateHomeGreeting } = require("./openai.service");

async function analyzeUserMood(req, res) {
  console.log("=== /api/ai/analyze-mood ===");

  try {
    const {
      name = "Usuario",
      answers = [],
      lastMood = null,
      recentGenres = [],
    } = req.body || {};

    if (!answers || (Array.isArray(answers) && answers.length === 0)) {
      return res.status(400).json({
        ok: false,
        message: "answers es requerido",
      });
    }

    const result = await analyzeMood({
      name: String(name || "Usuario").trim(),
      answers,
      lastMood,
      recentGenres,
    });

    return res.json({
      ok: true,
      data: result,
    });
  } catch (e) {
    console.log("ERROR IA analyze-mood:", e.message);

    return res.status(500).json({
      ok: false,
      message: "Error al analizar el mood con IA",
      detail: e.message,
    });
  }
}

async function getHomeGreeting(req, res) {
  console.log("=== /api/ai/home-greeting ===");

  try {
    const { name = "Usuario", hour = new Date().getHours() } = req.body || {};

    const result = await generateHomeGreeting({
      name: String(name || "Usuario").trim(),
      hour: Number(hour),
    });

    return res.json({
      ok: true,
      data: result,
    });
  } catch (e) {
    console.log("ERROR HOME IA:", e.message);

    const safeName = String(req.body?.name || "").trim();
    const currentHour = Number(req.body?.hour ?? new Date().getHours());

    let greeting = "Hola";

    if (currentHour < 12) {
      greeting = safeName ? `Buenos días, ${safeName}` : "Buenos días";
    } else if (currentHour < 19) {
      greeting = safeName ? `Hola, ${safeName}` : "Hola";
    } else {
      greeting = safeName ? `Qué tal, ${safeName}` : "Qué tal";
    }

    return res.json({
      ok: true,
      data: {
        greeting,
        subtitle: "Dato cinéfilo",
        lead: "La música en el cine puede cambiar por completo cómo se siente una escena.",
      },
    });
  }
}

module.exports = {
  analyzeUserMood,
  getHomeGreeting,
};
