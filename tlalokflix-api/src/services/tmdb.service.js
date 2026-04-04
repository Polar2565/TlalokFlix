const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_TIMEOUT_MS = Number(process.env.TMDB_TIMEOUT_MS || 12000);

function getTmdbHeaders() {
  const token = String(process.env.TMDB_TOKEN || "").trim();

  if (!token) {
    throw new Error("Falta TMDB_TOKEN en el .env del backend");
  }

  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function tmdbGet(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${TMDB_BASE}${cleanPath}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: getTmdbHeaders(),
      signal: controller.signal,
    });

    const raw = await res.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!res.ok) {
      const detail =
        typeof data === "string"
          ? data
          : data?.status_message || data?.message || res.statusText;

      throw new Error(`TMDB ${res.status}: ${detail}`);
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`TMDB timeout después de ${TMDB_TIMEOUT_MS} ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  tmdbGet,
};
