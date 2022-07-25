const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;

const uri = "mongodb+srv://joseph:Js%403213@joseph-cluster.nkuuek9.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

const databaseName = 'sample_mflix';
const movieCollName = 'movies';
const commentCollName = 'comments';

module.exports = {}

// https://www.mongodb.com/docs/drivers/node/current/usage-examples/find/
module.exports.getAll = async () => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);

  const query = {};
  let movieCursor = await movies.find(query).limit(10).project({title: 1}).sort({runtime: -1});

  return movieCursor.toArray();
}

// Get all comments for a given movie
module.exports.getAllComments = async (movieId) => {
  const database = client.db(databaseName);
  const comments = database.collection(commentCollName);

  // Check if the movieId is valid or not
  if (!ObjectId.isValid(movieId)) {
    return {error: `The id: ${movieId} is not a valid movie-Id`}
  } else {
    const query = { movie_id: ObjectId(movieId) };
    let commentCursor = await comments.find(query);
    return commentCursor.toArray();
  }
}

// https://www.mongodb.com/docs/drivers/node/current/usage-examples/findOne/
module.exports.getById = async (movieId) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);
  const query = {_id: ObjectId(movieId)};
  let movie = await movies.findOne(query);

  return movie;
}

module.exports.getByTitle = async (title) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);
  const query = {title: title};
  let movie = await movies.findOne(query);

  return movie;
}

module.exports.getByIdOrTitle = async (identifier) => {
  let movie;

  if(ObjectId.isValid(identifier)){
    movie = module.exports.getById(identifier);
  } else {
    movie = module.exports.getByTitle(identifier);
  }
  if (movie) {
    return movie;
  } else {
    return {error: `No item found with identifier ${identifier}.`}
  }
}

// Get comment by id
module.exports.getCommentById = async (commentId) => {
  const database = client.db(databaseName);
  const comments = database.collection(commentCollName);
  // Check if the commentId is valid or not
  if (!ObjectId.isValid(commentId)) {
    return {error: `The id: ${commentId} is not a valid commentId`}
  } else {
    const query = {_id: ObjectId(commentId)};
    let comment = await comments.findOne(query);
    if (comment) {
      return comment;
    } else {
      return {error: `No comment found with id: ${commentId}.`}
    }
  }
}

// Get all movies for a given genreName
module.exports.getMoviesByGenre = async (genreName) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);
  const query = {genres: { $in: [genreName] }};
  let movieCursor = await movies.find(query).limit(10).project({title: 1, genres: 1}).sort({title: 1});

  return movieCursor.toArray();
}

// https://www.mongodb.com/docs/v4.4/tutorial/insert-documents/
module.exports.create = async (newObj) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);

  if(!newObj.title){
    // Invalid movie object, shouldn't go in database.
    return {error: "Movies must have a title."}
  }
  const result = await movies.insertOne(newObj);

  if(result.acknowledged){
    return { newObjectId: result.insertedId, message: `Item created! ID: ${result.insertedId}` }
  } else {
    return {error: "Something went wrong. Please try again."}
  }
}

module.exports.createComment = async (movieId, newObj) => {
  const database = client.db(databaseName);
  const comments = database.collection(commentCollName);

  if(!(newObj.name)){
    // Invalid comment object, shouldn't go in database.
    return {error: "Comments must have a user's name."}
  }

  if (!ObjectId.isValid(movieId)) {
    return {error: `Invalid movie id: ${movieId}. Please input a valid one.`};
  }
  const result = await comments.insertOne({...newObj, movie_id: ObjectId(movieId), date: new Date()});

  if(result.acknowledged){
    return { newObjectId: result.insertedId, message: `Comment created! ID: ${result.insertedId}` }
  } else {
    return {error: "Something went wrong. Please try again."}
  }
}

// https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/change-a-document/
module.exports.updateById = async (movieId, newObj) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);

  // Check if the movieId is valid or not
  if (!ObjectId.isValid(movieId)) {
    return {error: `The movie id: ${movieId} is invalid. Please try another one.`}
  }

  if (!(newObj.title)) {
    // Invalid movie object, shouldn't go in database.
    return {error: "Movies must have a title."}
  }

  // Product team says only these two fields can be updated.
  const updateRules = {
    $set: {"title" : newObj.title, "plot": newObj.plot}
  };
  const filter = { _id: ObjectId(movieId) };
  const result = await movies.updateOne(filter, updateRules);

  if(result.modifiedCount != 1){
    return {error: `Something went wrong. ${result.modifiedCount} movies were updated. Please try again.`}
  };

  const updatedMovie = module.exports.getById(movieId);
  return updatedMovie;
}

// Update a given comment
module.exports.updateCommentById = async (commentId, newObj) => {
  const database = client.db(databaseName);
  const comments = database.collection(commentCollName);

  // Check if the commnetId is valid or not
  if (!ObjectId.isValid(commentId)) {
    return {error: `the comment id: ${commentId} is invalid. Please try another one.`}
  }

  // Only text and date fields can be updated.
  const updateRules = {
    $set: {"text" : newObj.text, "date": new Date()}
  };
  const filter = { _id: ObjectId(commentId) };
  const result = await comments.updateOne(filter, updateRules);

  if(result.modifiedCount != 1){
    return {error: `Something went wrong. ${result.modifiedCount} comments were updated. Please try again.`}
  };

  const updatedComment = module.exports.getCommentById(commentId);
  return updatedComment;
}

// https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/delete/
module.exports.deleteById = async (movieId) => {
  const database = client.db(databaseName);
  const movies = database.collection(movieCollName);

  // Check if the movieId is valid or not
  if (!ObjectId.isValid(movieId)) {
    return {error: `The given id: ${movieId} is invalid. Please try another one.`}
  }

  const deletionRules = {_id:ObjectId(movieId)}
  const result = await movies.deleteOne(deletionRules);

  if(result.deletedCount != 1){
    return {error: `Something went wrong. ${result.deletedCount} movies were deleted. Please try again.`}
  };

  return {message: `Deleted ${result.deletedCount} movie.`};
}

// Delete a given comment by its id
module.exports.deleteCommentById = async (commentId) => {
  const database = client.db(databaseName);
  const comments = database.collection(commentCollName);

  // Check if the comment id is valid or not
  if (!ObjectId.isValid(commentId)) {
    return {error: `The given id: ${commentId} is invalid. Please try another one.`}
  }
  const deletionRules = {_id:ObjectId(commentId)}
  const result = await comments.deleteOne(deletionRules);

  if(result.deletedCount != 1){
    return {error: `Something went wrong. ${result.deletedCount} comments were deleted. Please try again.`}
  };

  return {message: `Deleted ${result.deletedCount} comment.`};
}