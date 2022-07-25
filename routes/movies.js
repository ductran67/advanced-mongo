const { Router } = require("express");
const router = Router();

const movieData = require('../dataInterface/movies');

// curl http://localhost:5000/movies
router.get("/", async (req, res, next) => {
  let movieList = await movieData.getAll();

  if(movieList){
    res.status(200).send(movieList)
  } else {
    // If movieList is empty/null, something serious is wrong with the MongoDB connection.
    res.status(500).send({error: "Something went wrong. Please try again."})
  }
});

// This route handles either id or title as an identifier.
// curl http://localhost:5000/movies/573a1390f29313caabcd4135
// curl http://localhost:5000/movies/Jurassic%20Park
router.get("/:id", async (req, res, next) => {
  const result = await movieData.getByIdOrTitle(req.params.id);
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({error: `No item found with identifier ${req.params.id}.`});
  }
});

// curl -X POST -H "Content-Type: application/json" -d '{"title":"Llamas From Space", "plot":"Aliens..."}' http://localhost:5000/movies
router.post("/", async (req, res, next) => {
  let resultStatus;
  let result = await movieData.create(req.body);

  if (!result) {
    res.status(500).send({error: "Something went wrong. Please try again."});
  } else {
    if (result.error) {
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  }
});

// curl -X PUT -H "Content-Type: application/json" -d '{"plot":"Sharks..."}' http://localhost:5000/movies/573a13a3f29313caabd0e77b
router.put("/:id", async (req, res, next) => {
  let resultStatus;
  const result = await movieData.updateById(req.params.id, req.body)
  console.log(result);
  if (!result) {
    res.status(500).send({error: "Something went wrong. Please try again."});
  } else {
    if(result.error){
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  }
});

// curl -X DELETE http://localhost:5000/movies/573a1390f29313caabcd4135
router.delete("/:id", async (req, res, next) => {
  const result = await movieData.deleteById(req.params.id);
  if (!result) {
    res.status(500).send({error: "Something went wrong. Please try again."});
  } else {
    if (result.error) {
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  }
});

// Get all comments for a given movie
// curl http://localhost:5000/movies/573a1390f29313caabcd516c/comments
router.get("/:movieId/comments", async (req, res, next) => {
  let result = await movieData.getAllComments(req.params.movieId);

  if (result) {
    if (result.length > 0) {
      res.status(200).send(result)
    } else {
      res.status(404).send({message: `No comment found with the movie id: ${req.params.movieId}`})
    }
  } else {
    res.status(500).send({error: "Something went wrong. Please try again."})
  }
});

// Get a single comment by id
// curl http://localhost:5000/movies/573a1392f29313caabcd98c3/comments/5a9427648b0beebeb6957d45
router.get("/:movieId/comments/:commentId", async (req, res, next) => {
  const result = await movieData.getCommentById(req.params.commentId);
  if (result.error) {
    resultStatus = 404;
  } else {
    resultStatus = 200;
  }
  res.status(resultStatus).send(result);
});

// Add a new comment to comments collection
// curl -X POST -H "Content-Type: application/json" -d '{"name":"Joseph", "email":"test@test.com", "text":"Add test comment..."}' http://localhost:5000/movies/573a1390f29313caabcd516c/comments
router.post("/:movieId/comments", async (req, res, next) => {
  let resultStatus;
  let result = await movieData.createComment(req.params.movieId, req.body);

  if (!result) {
    res.status(500).send({error: "Something went wrong. Please try again."});
  } else {
    if(result.error){
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  }
});

// Update a given comment
// curl -X PUT -H "Content-Type: application/json" -d '{"text":"Update test comment..."}' http://localhost:5000/movies/573a1391f29313caabcd6f98/comments/5a9427648b0beebeb6957abd
router.put("/:movieId/comments/:commentId", async (req, res, next) => {
  let resultStatus;
  const result = await movieData.updateCommentById(req.params.commentId, req.body)

  if(result.error){
    resultStatus = 400;
  } else {
    resultStatus = 200;
  }

  res.status(resultStatus).send(result);
});

// Delete a given comments
// curl -X DELETE http://localhost:5000/movies/573a1390f29313caabcd516c/comments/62db6028c377d89d36712a1b
router.delete("/:movieId/comments/:commentId", async (req, res, next) => {
  const result = await movieData.deleteCommentById(req.params.commentId);

  if (!result) {
    res.status(500).send({error:"Something went wrong. Please try again."});
  } else {
    if(result.error){
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  }
});

// Get all movies by genre's name
// curl http://localhost:5000/movies/genres/Short
router.get("/genres/:genreName", async (req, res, next) => {
  const result = await movieData.getMoviesByGenre(req.params.genreName);

  if (result) {
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send({error: `No movie found with the genre: ${req.params.genreName}`});
    }
  } else {
    res.status(500).send({error:"Something went wrong. Please try again."})
  }
});

module.exports = router;
