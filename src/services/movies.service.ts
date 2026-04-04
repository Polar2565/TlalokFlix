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

export type Genre = { id: number; name: string };

export type MoviesPage = {
  items: Movie[];
  page: number;
  totalPages: number;
  totalResults: number;
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
  page?: number;
  total_pages?: number;
  total_results?: number;
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

type TmdbGenresResponse = {
  genres: Genre[];
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

function mapMoviesPage(data: TmdbListResponse): MoviesPage {
  return {
    items: Array.isArray(data?.results) ? data.results.map(mapMovie) : [],
    page: Number(data?.page || 1),
    totalPages: Number(data?.total_pages || 1),
    totalResults: Number(data?.total_results || 0),
  };
}

export const moviesService = {
  getPopularPage: async (page = 1): Promise<MoviesPage> => {
    const data = await api.get<TmdbListResponse>(
      `/api/movies/popular?page=${page}`,
    );
    return mapMoviesPage(data);
  },

  getPopular: async (page = 1): Promise<Movie[]> => {
    const data = await moviesService.getPopularPage(page);
    return data.items;
  },

  searchMoviesPage: async (query: string, page = 1): Promise<MoviesPage> => {
    const q = String(query || "").trim();
    if (!q) {
      return {
        items: [],
        page: 1,
        totalPages: 1,
        totalResults: 0,
      };
    }

    const encoded = encodeURIComponent(q);

    const data = await api.get<TmdbListResponse>(
      `/api/movies/search?query=${encoded}&page=${page}`,
    );

    return mapMoviesPage(data);
  },

  searchMovies: async (query: string, page = 1): Promise<Movie[]> => {
    const data = await moviesService.searchMoviesPage(query, page);
    return data.items;
  },

  getGenres: async (): Promise<Genre[]> => {
    const data = await api.get<TmdbGenresResponse>("/api/movies/genres");
    return data.genres || [];
  },

  discoverByGenrePage: async (
    genreId: number,
    page = 1,
  ): Promise<MoviesPage> => {
    const data = await api.get<TmdbListResponse>(
      `/api/movies/discover?genreId=${genreId}&page=${page}`,
    );
    return mapMoviesPage(data);
  },

  discoverByGenre: async (genreId: number, page = 1): Promise<Movie[]> => {
    const data = await moviesService.discoverByGenrePage(genreId, page);
    return data.items;
  },

  getById: async (id: string) => {
    const data = await api.get<TmdbMovie>(`/api/movies/${id}`);
    return mapMovie(data);
  },

  getDetailFull: async (id: string): Promise<MovieDetailFull> => {
    return await api.get<MovieDetailFull>(`/api/movies/${id}`);
  },

  getTrailerKey: async (id: string): Promise<string | null> => {
    const data = await api.get<TmdbVideosResponse>(`/api/movies/${id}/videos`);

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

  getMovie: async (id: string) => {
    return await moviesService.getById(id);
  },
};
