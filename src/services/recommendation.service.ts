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

type TmdbListResponse = { results: TmdbMovie[] };

const IMG_500 = "https://image.tmdb.org/t/p/w500";

// Mapeo “mood -> géneros”
const MOOD_GENRES: Record<MoodKey, string> = {
  calm: "10749,18", // Romance, Drama
  happy: "35,16,12", // Comedy, Animation, Adventure
  sad: "18", // Drama
  angry: "28,53,27", // Action, Thriller, Horror
};

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

export const recommendationService = {
  async getForMood(mood: MoodKey) {
    const with_genres = MOOD_GENRES[mood];
    const data = await api.tmdbGet<TmdbListResponse>(
      `/discover/movie?language=es-MX&sort_by=popularity.desc&include_adult=false&page=1&with_genres=${with_genres}`,
    );
    return data.results.map(mapMovie);
  },
};
