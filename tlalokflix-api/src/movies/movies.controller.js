const { tmdbGet } = require("../services/tmdb.service");

function buildQuery(params) {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function safePage(value) {
  const page = Number(value || 1);
  if (!Number.isFinite(page) || page < 1) return 1;
  if (page > 500) return 500;
  return page;
}

async function getPopular(req, res) {
  try {
    const page = safePage(req.query.page);

    const data = await tmdbGet(`/movie/popular?language=es-MX&page=${page}`);

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al obtener películas populares",
      detail: e.message,
    });
  }
}

async function searchMovies(req, res) {
  try {
    const query = String(req.query.query || "").trim();
    const page = safePage(req.query.page);

    if (!query) {
      return res.status(400).json({ message: "query es requerido" });
    }

    const encoded = encodeURIComponent(query);

    const data = await tmdbGet(
      `/search/movie?language=es-MX&query=${encoded}&page=${page}&include_adult=false`,
    );

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al buscar películas",
      detail: e.message,
    });
  }
}

async function getGenres(req, res) {
  try {
    const data = await tmdbGet("/genre/movie/list?language=es-MX");
    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al obtener géneros",
      detail: e.message,
    });
  }
}

async function discoverByGenre(req, res) {
  try {
    const page = safePage(req.query.page);

    const genreId = String(req.query.genreId || "").trim();
    const withGenres = String(req.query.with_genres || genreId || "").trim();
    const withoutGenres = String(req.query.without_genres || "").trim();
    const sortBy = String(req.query.sort_by || "popularity.desc").trim();
    const minVote = String(req.query["vote_average.gte"] || "").trim();
    const minVotes = String(req.query["vote_count.gte"] || "").trim();

    if (!withGenres) {
      return res.status(400).json({
        message: "with_genres o genreId es requerido",
      });
    }

    const qs = buildQuery({
      language: "es-MX",
      include_adult: "false",
      include_video: "false",
      page,
      sort_by: sortBy,
      with_genres: withGenres,
      without_genres: withoutGenres,
      "vote_average.gte": minVote,
      "vote_count.gte": minVotes,
    });

    const data = await tmdbGet(`/discover/movie?${qs}`);

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al descubrir películas",
      detail: e.message,
    });
  }
}

async function getMovieById(req, res) {
  try {
    const { id } = req.params;

    const data = await tmdbGet(`/movie/${id}?language=es-MX`);

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al obtener película",
      detail: e.message,
    });
  }
}

async function getMovieVideos(req, res) {
  try {
    const { id } = req.params;

    const data = await tmdbGet(`/movie/${id}/videos?language=es-MX`);

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Error al obtener videos de la película",
      detail: e.message,
    });
  }
}

module.exports = {
  getPopular,
  searchMovies,
  getGenres,
  discoverByGenre,
  getMovieById,
  getMovieVideos,
};
