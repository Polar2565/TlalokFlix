import type { MoodKey } from "../data/survey";
import { api } from "./api.service";
import type { Movie } from "./movies.service";

type TmdbMovie = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  overview: string;
};

type TmdbListResponse = {
  results: TmdbMovie[];
};

const IMG_500 = "https://image.tmdb.org/t/p/w500";

function mapMovie(m: TmdbMovie): Movie {
  return {
    id: String(m.id),
    title: m.title,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : 0,
    rating: Math.round((Number(m.vote_average) || 0) * 10) / 10,
    poster: m.poster_path ? `${IMG_500}${m.poster_path}` : null,
    overview: m.overview || "",
  };
}

type MoodProfile = {
  includeGenres: string;
  excludeGenres?: string;
  minVote?: number;
  minVotes?: number;
  sortBy?: string;
};

const MOOD_PROFILES: Record<MoodKey, MoodProfile> = {
  calm: {
    includeGenres: "16,10751,14,12,18",
    excludeGenres: "27,53,80",
    minVote: 6.0,
    minVotes: 80,
    sortBy: "vote_average.desc",
  },
  happy: {
    includeGenres: "35,16,12,10751,10402",
    excludeGenres: "27",
    minVote: 5.8,
    minVotes: 70,
    sortBy: "popularity.desc",
  },
  sad: {
    includeGenres: "18,10749,36",
    excludeGenres: "27,35",
    minVote: 6.1,
    minVotes: 90,
    sortBy: "vote_average.desc",
  },
  angry: {
    includeGenres: "28,53,80",
    excludeGenres: "10751",
    minVote: 5.8,
    minVotes: 100,
    sortBy: "popularity.desc",
  },
};

const AI_GENRE_MAP: Record<string, number[]> = {
  accion: [28],
  acción: [28],
  action: [28],

  aventura: [12],
  adventure: [12],

  animacion: [16],
  animación: [16],
  animation: [16],

  comedia: [35],
  comedy: [35],
  "comedia ligera": [35],
  "comedia romantica": [35, 10749],
  "comedia romántica": [35, 10749],

  crimen: [80],
  crime: [80],

  documental: [99],
  documentary: [99],

  drama: [18],

  familia: [10751],
  family: [10751],
  "feel good": [35, 10751],

  fantasia: [14],
  fantasía: [14],
  fantasy: [14],

  historia: [36],
  history: [36],

  horror: [27],
  terror: [27],

  musica: [10402],
  música: [10402],
  music: [10402],

  misterio: [9648],
  mystery: [9648],

  romance: [10749],
  romantic: [10749],
  romantico: [10749],
  romántico: [10749],

  "ciencia ficcion": [878],
  "ciencia ficción": [878],
  "sci-fi": [878],
  scifi: [878],

  thriller: [53],
  suspenso: [53],

  guerra: [10752],
  war: [10752],

  western: [37],

  inspiracional: [18, 12],
  motivacional: [18, 12],
  deportivo: [18],
  deporte: [18],
};

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapAiGenresToIds(preferredGenres?: string[]) {
  if (!Array.isArray(preferredGenres) || preferredGenres.length === 0) {
    return [];
  }

  const ids = new Set<number>();

  for (const raw of preferredGenres) {
    const key = normalizeText(raw);
    const found = AI_GENRE_MAP[key];

    if (found?.length) {
      found.forEach((id) => ids.add(id));
    }
  }

  return Array.from(ids);
}

function mergeGenreIds(profileIds: string, aiGenreIds: number[]) {
  const base = profileIds
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const ai = aiGenreIds.map(String);

  return Array.from(new Set([...base, ...ai])).join(",");
}

function buildDiscoverPath(
  profile: MoodProfile,
  page: number,
  preferredGenres?: string[],
  relaxed = false,
) {
  const aiGenreIds = mapAiGenresToIds(preferredGenres);

  const params: Record<string, string> = {
    page: String(page),
    sort_by: relaxed ? "popularity.desc" : profile.sortBy || "popularity.desc",
    with_genres: mergeGenreIds(profile.includeGenres, aiGenreIds),
  };

  if (profile.excludeGenres) {
    params.without_genres = profile.excludeGenres;
  }

  if (typeof profile.minVote === "number") {
    params["vote_average.gte"] = String(
      relaxed ? Math.max(5.0, profile.minVote - 0.8) : profile.minVote,
    );
  }

  if (typeof profile.minVotes === "number") {
    params["vote_count.gte"] = String(
      relaxed
        ? Math.max(30, Math.floor(profile.minVotes * 0.45))
        : profile.minVotes,
    );
  }

  const qs = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  return `/api/movies/discover?${qs}`;
}

function uniqueById(list: Movie[]) {
  const seen = new Set<string>();
  const out: Movie[] = [];

  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }

  return out;
}

function primaryQualityFilter(list: Movie[]) {
  return list
    .filter((m) => !!m.poster)
    .filter((m) => (m.year ? m.year >= 1990 : true))
    .filter((m) => (typeof m.rating === "number" ? m.rating >= 5.4 : true));
}

function relaxedQualityFilter(list: Movie[]) {
  return list
    .filter((m) => !!m.poster)
    .filter((m) => (m.year ? m.year >= 1980 : true));
}

async function fetchPages(
  profile: MoodProfile,
  preferredGenres?: string[],
  relaxed = false,
) {
  const results = await Promise.allSettled([
    api.get<TmdbListResponse>(
      buildDiscoverPath(profile, 1, preferredGenres, relaxed),
    ),
    api.get<TmdbListResponse>(
      buildDiscoverPath(profile, 2, preferredGenres, relaxed),
    ),
  ]);

  const merged: TmdbMovie[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && Array.isArray(result.value?.results)) {
      merged.push(...result.value.results);
    }
  }

  return merged.map(mapMovie);
}

async function fetchPopularFallback() {
  const results = await Promise.allSettled([
    api.get<TmdbListResponse>("/api/movies/popular?page=1"),
    api.get<TmdbListResponse>("/api/movies/popular?page=2"),
  ]);

  const merged: TmdbMovie[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && Array.isArray(result.value?.results)) {
      merged.push(...result.value.results);
    }
  }

  return merged.map(mapMovie);
}

export const recommendationService = {
  async getForMood(mood: MoodKey, preferredGenres?: string[]) {
    const profile = MOOD_PROFILES[mood] ?? MOOD_PROFILES.calm;

    const strictWithAi = await fetchPages(profile, preferredGenres, false);
    let merged = uniqueById(strictWithAi);
    let filtered = primaryQualityFilter(merged);

    if (filtered.length >= 8) {
      return filtered.slice(0, 12);
    }

    const strictBase = await fetchPages(profile, [], false);
    merged = uniqueById([...merged, ...strictBase]);
    filtered = primaryQualityFilter(merged);

    if (filtered.length >= 8) {
      return filtered.slice(0, 12);
    }

    const relaxedWithAi = await fetchPages(profile, preferredGenres, true);
    merged = uniqueById([...merged, ...relaxedWithAi]);
    filtered = primaryQualityFilter(merged);

    if (filtered.length >= 6) {
      return filtered.slice(0, 12);
    }

    const relaxedBase = await fetchPages(profile, [], true);
    merged = uniqueById([...merged, ...relaxedBase]);
    filtered = primaryQualityFilter(merged);

    if (filtered.length > 0) {
      return filtered.slice(0, 12);
    }

    const softer = relaxedQualityFilter(merged);
    if (softer.length > 0) {
      return softer.slice(0, 12);
    }

    const popular = await fetchPopularFallback();
    const popularFiltered = primaryQualityFilter(uniqueById(popular));

    if (popularFiltered.length > 0) {
      return popularFiltered.slice(0, 12);
    }

    return uniqueById(popular).slice(0, 12);
  },
};
