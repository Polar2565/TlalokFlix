import { api } from "./api.service";

export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  poster: string | null;
  overview: string;
};

export type MovieDetailFull = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
};

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

type TmdbVideosResponse = {
  results: {
    id: string;
    key: string;
    site: string;
    type: string;
    official?: boolean;
  }[];
};

const IMG_500 = "https://image.tmdb.org/t/p/w500";

function mapMovie(m: TmdbMovie): Movie {
  return {
    id: String(m.id),
    title: m.title,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : 0,
    rating: Math.round(m.vote_average * 10) / 10,
    poster: m.poster_path ? `${IMG_500}${m.poster_path}` : null,
    overview: m.overview || "",
  };
}

export const moviesService = {
  // 🔹 Listado popular
  getPopular: async () => {
    const data = await api.tmdbGet<TmdbListResponse>(
      "/movie/popular?language=es-MX&page=1",
    );
    return data.results.map(mapMovie);
  },

  // 🔹 Detalle básico (NO lo tocamos)
  getById: async (id: string) => {
    const data = await api.tmdbGet<TmdbMovie>(`/movie/${id}?language=es-MX`);
    return mapMovie(data);
  },

  // 🔥 Detalle COMPLETO (para la vista tipo TMDB)
  getDetailFull: async (id: string): Promise<MovieDetailFull> => {
    return await api.tmdbGet<MovieDetailFull>(`/movie/${id}?language=es-MX`);
  },

  // 🔹 Trailer (YouTube)
  getTrailerKey: async (id: string): Promise<string | null> => {
    const data = await api.tmdbGet<TmdbVideosResponse>(
      `/movie/${id}/videos?language=es-MX`,
    );

    const official = data.results.find(
      (v) =>
        v.site === "YouTube" && v.type === "Trailer" && v.official === true,
    );
    if (official?.key) return official.key;

    const trailer = data.results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer",
    );
    if (trailer?.key) return trailer.key;

    const teaser = data.results.find(
      (v) => v.site === "YouTube" && v.type === "Teaser",
    );
    return teaser?.key ?? null;
  },
};
