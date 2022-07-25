const request = require("supertest");
const server = require("../server");

jest.mock("../dataInterface/movies");
const movieData = require("../dataInterface/movies");

describe("/movies routes", () => {

  beforeEach(() => {

  });

  describe("GET /", () =>{
    it("should return an array on success", async () => {
      movieData.getAll.mockResolvedValue([{_id:"890", title:"One Day"}]);
      const res = await request(server).get("/movies");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message on error", async () => {
      movieData.getAll.mockResolvedValue(null);
      const res = await request(server).get("/movies");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /:id", () =>{
    it("should return a single movie on success", async () => {
      movieData.getByIdOrTitle.mockResolvedValue({_id: "123", title: "Blacksmith Scene"});
      const res = await request(server).get("/movies/123");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message on error", async () => {
      movieData.getByIdOrTitle.mockResolvedValue(null);
      const res = await request(server).get("/movies/000");
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBeDefined();
    });

  });

  describe("POST /", () =>{
    it("should return the new movie on success", async () => {
      movieData.create.mockResolvedValue({"newObjectId":"62d63","message":"Item created! ID: 62d63"});
      const res = await request(server).post("/movies");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message if body is missing title", async () => {
      movieData.create.mockResolvedValue({"error":"Movies must have a title."});
      const res = await request(server).post("/movies");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return an error message if movie fails to be created", async () => {
      movieData.create.mockResolvedValue(null);
      const res = await request(server).post("/movies");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("PUT /:id", () =>{
    it("should return the updated movie on success", async () => {
      movieData.updateById.mockResolvedValue({_id: 123, title:"Update title"});
      const res = await request(server).put("/movies/123");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message if movie id is invalid or not found", async () => {
      movieData.updateById.mockResolvedValue({"error":"Something went wrong. 0 movies were updated. Please try again."});
      const res = await request(server).put("/movies/123");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return an error message if movie fails to be updated", async () => {
      movieData.updateById.mockResolvedValue(null);
      const res = await request(server).put("/movies/123");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("DELETE /:id", () =>{
    it("should return a message on success", async () => {
      movieData.deleteById.mockResolvedValue({message: "Deleted 1 movie"});
      const res = await request(server).delete("/movies/123");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });
    it("should return a error message if the given movieId is invalid or not found.", async () => {
      movieData.deleteById.mockResolvedValue({"error":"Something went wrong. 0 movies were deleted. Please try again."});
      const res = await request(server).delete("/movies/123");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });
    it("should return a error message if movie fails to be deleted", async () => {
      movieData.deleteById.mockResolvedValue(null);
      const res = await request(server).delete("/movies/123");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test all comments endpoints - Get all comments for a given movie: getAllComments
  describe("GET /:movieId/comments", () =>{
    it("should return an array of comments on success", async () => {
      movieData.getAllComments.mockResolvedValue([{_id:"890", name:"Joseph", movie_id: "123"}]);

      const res = await request(server).get("/movies/123/comments");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a status code of 404 if no comment found with the movie's id", async () => {
      movieData.getAllComments.mockResolvedValue({"message":"No comment found with the movie id: 123"});
      const res = await request(server).get("/movies/123/comments");

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).not.toBeDefined();
      expect(res.body.message).toBeDefined();
    });

    it("should return an error message on error", async () => {
      movieData.getAllComments.mockResolvedValue(null);
      const res = await request(server).get("/movies/123/comments");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Get a single comment: getCommentById
  describe("GET /:movieId/comments/:commentId", () =>{
    it("should return a single comment on success", async () => {
      movieData.getCommentById.mockResolvedValue({_id:"890", name:"Joseph", movie_id: "123"});
      const res = await request(server).get("/movies/123/comments/321");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a status code of 404 if commentId is invalid or no comment found", async () => {
      movieData.getCommentById.mockResolvedValue({"error":"No comment found with id: 123."});
      const res = await request(server).get("/movies/000/comments/123");
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBeDefined();
    });
  });

  // Create a new comment for a given movie: createComment
  describe("POST /:movieId/comments", () =>{
    it("should return the new comment on success", async () => {
      // expect(false).toEqual(true);
      movieData.createComment.mockResolvedValue({"newObjectId":"12345","message":"Comment created! ID: 12345"});
      const res = await request(server).post("/movies/000/comments");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message if body is missing name", async () => {
      movieData.createComment.mockResolvedValue({"error":"Comments must have a user's name."});
      const res = await request(server).post("/movies/000/comments");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return an error message if comment fails to be created", async () => {
      movieData.createComment.mockResolvedValue(null);
      const res = await request(server).post("/movies/000/comments");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Update a given comment: updateCommentById
  describe("PUT /:movieId/comments/:commentId", () =>{
    it("should return the updated comment on success", async () => {
      movieData.updateCommentById.mockResolvedValue({_id: 321, name:"Update username", movie_id: 123});
      const res = await request(server).put("/movies/123/comments/321");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message if comment fails to be updated", async () => {
      movieData.updateCommentById.mockResolvedValue({error: "Something went wrong. 0 comments were updated. Please try again."});
      const res = await request(server).put("/movies/123/comments/321");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });
  });

  // Delete a given comment: deleteCommentById
  describe("DELETE /:movieId/comments/:commentId", () =>{
    it("should return a message on success", async () => {
      movieData.deleteCommentById.mockResolvedValue({message: "Deleted 1 comment"});
      const res = await request(server).delete("/movies/123/comments/321");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a error message if comment id is invalid or not found.", async () => {
      movieData.deleteCommentById.mockResolvedValue({error: `The given id: 321 is invalid or not found. Please try another one.`});
      const res = await request(server).delete("/movies/123/comments/321");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return an error message if comment fails to be deleted", async () => {
      movieData.deleteCommentById.mockResolvedValue(null);
      const res = await request(server).delete("/movies/123/comments/321");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test "movies by genres" endpoint
  describe("GET /genres/:genreName", () =>{
    it("should return an array of movies on success", async () => {
      // TODO: Mock the correct data interface method
      movieData.getMoviesByGenre.mockResolvedValue([{_id: 123, genres: ["Short"], title: "Title testing"}]);
      const res = await request(server).get("/movies/genres/Short");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });
    it("should return an empty array if no movies match genre", async () => {
      // TODO: Mock the correct data interface method
      movieData.getMoviesByGenre.mockResolvedValue({"error":"No movie found with the genre: UEOA921DI"});
      const res = await request(server).get("/movies/genres/UEOA921DI");

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBeDefined();
    });
    it("should return an error message on error", async () => {
      // TODO: Mock the correct data interface method
      movieData.getMoviesByGenre.mockResolvedValue(null);
      const res = await request(server).get("/movies/genres/Short");

      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

});