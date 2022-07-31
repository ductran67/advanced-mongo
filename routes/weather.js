const { Router } = require("express");
const router = Router();

const weatherData = require('../dataInterface/weather');

// curl http://localhost:5000/weather?callLetters=VC81
// curl "http://localhost:5000/weather?minAirTemp=5&maxAirTemp=90"
// curl http://localhost:5000/weather?section=AG1
// curl "http://localhost:5000/weather?callLetters=VC81&minAirTemp=35"
// curl "http://localhost:5000/weather?section=AG1&callLetters=VC81"
router.get("/", async (req, res, next) => {
  // Define "result" variable started by null value
  let result = null;

  // Check if the call letters is requested or not
  if (req.query.callLetters) {
    result = await weatherData.getByCallLetters(req.query.callLetters);
  }

  // Check if the minAirTemp or the maxAirTemp is requested or not
  if (req.query.minAirTemp || req.query.maxAirTemp) {
    result = await weatherData.getByAirTemp(req.query.minAirTemp, req.query.maxAirTemp);
  }
  // Check if the section is requested or not
  if (req.query.section) {
    result = await weatherData.getBySection(req.query.section);
  }
  // Check if the call-letters and the minAirTemp are requested
  if (req.query.callLetters && req.query.minAirTemp) {
    result = await weatherData.getByCallLettersAndMinAirTemp(req.query.callLetters, req.query.minAirTemp);
  }

  // Extra credit - Check if the section and the callLetters are requested or not
  if (req.query.section && req.query.callLetters) {
    result = await weatherData.getBySectionAndCallLettersAndAverageAirTemp(req.query.section, req.query.callLetters);
  }

  if (!result) {
    // If weather data is empty/null, something serious is wrong with the MongoDB connection.
    res.status(500).send({error: "Something went wrong. Please try again."});
  } else {
    if (result.error) {
      res.status(400).send(result);
    }
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(422).send({message: 'No weather data found.'});      
    }
  }
});

// curl "http://localhost:5000/weather/VC81"
router.get("/:callLetters", async (req, res, next) => {
  const p = req.params.callLetters;
  const result = await weatherData.getByCallLetters(p);

  if (!result) {
    res.status(500).send({error: "Something went wrong. Please try again."})
  } else {
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send({error: `No weather data found with the call-letters: ${p}.`});
    }
  }
});

// curl -X POST -H "Content-Type: application/json" -d '{"airTemperature": {"value": 10, "quality": 1} }' http://localhost:5000/weather
router.post("/", async (req, res, next) => {
  let result = await weatherData.create(req.body);

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

module.exports = router;