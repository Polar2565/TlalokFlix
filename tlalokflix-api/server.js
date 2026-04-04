require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./src/auth/auth.routes");
const moviesRoutes = require("./src/movies/movies.routes");
const aiRoutes = require("./src/ai/ai.routes");
const { generateHomeGreeting } = require("./src/ai/openai.service");

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/ai", aiRoutes);

async function warmupOllama() {
  try {
    await generateHomeGreeting({
      name: "Usuario",
      hour: new Date().getHours(),
    });
    console.log("Ollama warmup OK");
  } catch (error) {
    console.log("Ollama warmup omitido:", error.message);
  }
}

const port = Number(process.env.PORT || 4000);

app.listen(port, "0.0.0.0", async () => {
  console.log(`API lista en http://0.0.0.0:${port}`);
  await warmupOllama();
});
