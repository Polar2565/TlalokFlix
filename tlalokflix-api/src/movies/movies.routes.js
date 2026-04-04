const express = require("express");
const {
  getPopular,
  searchMovies,
  getGenres,
  discoverByGenre,
  getMovieById,
  getMovieVideos,
} = require("./movies.controller");

const router = express.Router();

router.get("/popular", getPopular);
router.get("/search", searchMovies);
router.get("/genres", getGenres);
router.get("/discover", discoverByGenre);
router.get("/:id", getMovieById);
router.get("/:id/videos", getMovieVideos);

module.exports = router;
