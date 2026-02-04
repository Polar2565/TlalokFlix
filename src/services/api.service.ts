const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

if (!TMDB_TOKEN) {
  throw new Error("Falta EXPO_PUBLIC_TMDB_TOKEN en .env. Reinicia con -c.");
}

async function tmdbGet<T>(path: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export const api = { tmdbGet };
