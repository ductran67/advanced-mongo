const request = require("supertest");
const server = require("../server");

jest.mock("../dataInterface/weather");
const weatherData = require("../dataInterface/weather");

describe("/weather routes", () => {

  beforeEach(() => {

  });

  // Test "getByCallLetters" function
  describe("GET /:callLetters", () =>{
    it("should return an array on success", async () => {
      weatherData.getByCallLetters.mockResolvedValue([{_id:"890", airTemperature: {"value": 10, "quality": 1}}]);
      const res = await request(server).get("/weather/VC81");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message on error", async () => {
      weatherData.getByCallLetters.mockResolvedValue(null);
      const res = await request(server).get("/weather/VC81");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test "getByAirTemp" function
  describe("GET /", () =>{
    it("should return an array on success", async () => {
      weatherData.getByAirTemp.mockResolvedValue([{_id:"890", airTemperature: {"value": 10, "quality": 1}}]);
      const res = await request(server).get("/weather?minAirTemp=5&maxAirTemp=90");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message on error", async () => {
      weatherData.getByAirTemp.mockResolvedValue(null);
      const res = await request(server).get("/weather?minAirTemp=5&maxAirTemp=90");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test "getBySection" function
  describe("GET /", () =>{
    it("should return an array on success", async () => {
      weatherData.getBySection.mockResolvedValue([{_id:"890", airTemperature: {"value": 10, "quality": 1}}]);
      const res = await request(server).get("/weather?section=AG1");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a status code of 422 if no weather data found with the section", async () => {
      weatherData.getBySection.mockResolvedValue({message: 'No weather data found.'});
      const res = await request(server).get("/weather?section=AG1");

      expect(res.statusCode).toEqual(422);
      expect(res.body.error).not.toBeDefined();
      expect(res.body.message).toBeDefined();
    });

    it("should return an error message on error", async () => {
      weatherData.getBySection.mockResolvedValue(null);
      const res = await request(server).get("/weather?section=AG1");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test "getByCallLettersAndMinAirTemp" function
  describe("GET /", () =>{
    it("should return an array on success", async () => {
      weatherData.getByCallLettersAndMinAirTemp.mockResolvedValue([{_id:"890", airTemperature: {"value": 10, "quality": 1}}]);
      const res = await request(server).get("/weather?callLetters=VC81&minAirTemp=35");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a status code of 422 if no weather data found with the callLetters and the minimum air temperature.", async () => {
      weatherData.getByCallLettersAndMinAirTemp.mockResolvedValue({message: 'No weather data found.'});
      const res = await request(server).get("/weather?callLetters=VC81&minAirTemp=35");

      expect(res.statusCode).toEqual(422);
      expect(res.body.error).not.toBeDefined();
      expect(res.body.message).toBeDefined();
    });

    it("should return an error message on error", async () => {
      weatherData.getByCallLettersAndMinAirTemp.mockResolvedValue(null);
      const res = await request(server).get("/weather?callLetters=VC81&minAirTemp=35");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });

  // Test "getBySectionAndCallLettersAndAverageAirTemp" function
  describe("GET /", () =>{
    it("should return an array on success", async () => {
      weatherData.getBySectionAndCallLettersAndAverageAirTemp.mockResolvedValue([{_id:"890", airTemperature: {"value": 10, "quality": 1}}]);
      const res = await request(server).get("/weather?section=AG1&callLetters=VC81");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toEqual(true);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return a status code of 422 if no weather data found with the section and the callLetters.", async () => {
      weatherData.getBySectionAndCallLettersAndAverageAirTemp.mockResolvedValue({message: 'No weather data found.'});
      const res = await request(server).get("/weather?section=AG1&callLetters=VC81");

      expect(res.statusCode).toEqual(422);
      expect(res.body.error).not.toBeDefined();
      expect(res.body.message).toBeDefined();
    });

    it("should return an error message on error", async () => {
      weatherData.getBySectionAndCallLettersAndAverageAirTemp.mockResolvedValue(null);
      const res = await request(server).get("/weather?section=AG1&callLetters=VC81");
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });
  // Test the function "Create a new weather data report"
  describe("POST /", () =>{
    it("should return the a weather data report on success", async () => {
      weatherData.create.mockResolvedValue({"newObjectId":"123abc","message":"Item created! ID: 123abc"});
      const res = await request(server).post("/weather");
      expect(res.statusCode).toEqual(200);
      expect(res.body.error).not.toBeDefined();
    });

    it("should return an error message if body is missing air temperature value or the air temperature is not a number.", async () => {
      weatherData.create.mockResolvedValue({error: "Weather data must have a valid air temperature value."});
      const res = await request(server).post("/weather");
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return an error message if weather data report fails to be created", async () => {
      weatherData.create.mockResolvedValue(null);
      const res = await request(server).post("/weather");
      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toBeDefined();
    });
  });
});