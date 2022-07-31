const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;

const uri = "mongodb+srv://joseph:Js%403213@joseph-cluster.nkuuek9.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

const databaseName = 'sample_weatherdata';
const dataCollName = 'data';

module.exports = {}

// Get weather data by callLetters
module.exports.getByCallLetters = async (callLetters) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);
  const query = {callLetters: callLetters};

  let dataCursor = await weather.find(query).project({callLetters: 1}).limit(10);
  return dataCursor.toArray();
}

// Get weather data by air temperature
module.exports.getByAirTemp = async (minAirTemp, maxAirTemp) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);

  // Check if the minimum air temperature is a number or not
  if (isNaN(minAirTemp)) {
    return {error: `${minAirTemp} is not a valid minimum air temperature`}
  }

  // Check if max air temperature is valid or not
  if (maxAirTemp) {
    if (isNaN(maxAirTemp)) {
      return {error: `${maxAirTemp} is not a valid maximum air temperature`}
    }
    if (parseInt(maxAirTemp) <= parseInt(minAirTemp)) {
      return {error: `The maximun air temperature ${maxAirTemp} must be greater than the mininum one ${minAirTemp}`}
    }
  }
  // Set query option for searching the air temperature is between minAirTemp and maxAirTemp or above minAirTemp
  const queryOption = (maxAirTemp ? {'$gt': parseInt(minAirTemp), '$lt': parseInt(maxAirTemp)} : {'$gt': parseInt(minAirTemp)});
  const pineline = [
    {
      '$match': {
        'airTemperature.value': queryOption
      }
    }, {
      '$limit': 10
    }
  ];

  let dataCursor = await weather.aggregate(pineline).project({airTemperature: 1});
  return dataCursor.toArray();
}

// Get weather data by section
module.exports.getBySection = async (section) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);
  if (!(typeof section === 'string' && section.trim().length > 0)) {
    return {error: 'Invalid section.'}
  }
  // Option 1: using find(query)
  // const query = {sections: section};
  // let dataCursor = await weather.find(query).project({sections: 1}).limit(10);

  // Option 2: using aggregation pipeline
  const pineline = [
    {
      '$match': {
        'sections': section
      }
    }, {
      '$limit': 10
    }
  ];

  let dataCursor = await weather.aggregate(pineline).project({sections: 1});
  return dataCursor.toArray();
}

// Get weather data by call letters and minimum air temperature
module.exports.getByCallLettersAndMinAirTemp = async (callLetters, minAirTemp) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);
  // Check if the minimum air temperature is a number or not
  if (isNaN(minAirTemp)) {
    return {error: `${minAirTemp} is an invalid air temperature.`}
  }
  // Option 1: using find(query)
  // const query = {'callLetters': callLetters, 'airTemperature.value': {$gt: parseInt(minAirTemp)}};
  // let dataCursor = await weather.find(query).project({callLetters: 1, airTemperature: 1}).limit(10);

  // Option 2: using aggregation pineline
  const pineline = [
    {
      '$match': {
        'callLetters': callLetters, 
        'airTemperature.value': { '$gt': parseInt(minAirTemp) }
      }
    }, {
      '$limit': 10
    }
  ];
  let dataCursor = await weather.aggregate(pineline).project({callLetters: 1, airTemperature: 1});

  return dataCursor.toArray();
}

// Get weather data by 'section' and 'call-letters' and calculate average 'air temperature' group by 'position'
module.exports.getBySectionAndCallLettersAndAverageAirTemp = async (section, callLetters) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);
  const pineline = [
    {
      '$match': {
        'sections': {'$in': [section]}, 
        'callLetters': callLetters
      }
    }, {
      '$group': {
        '_id': '$position.coordinates', 
        'averageAirTemp': {
          '$avg': '$airTemperature.value'
        }
      }
    }, {
      '$limit': 10
    }
  ];
  let dataCursor = await weather.aggregate(pineline);
  return dataCursor.toArray();
}

// Create a new weather report
module.exports.create = async (newObj) => {
  const database = client.db(databaseName);
  const weather = database.collection(dataCollName);
  // Weather data must have a valid air temperature value
  if(!newObj.airTemperature.value || isNaN(newObj.airTemperature.value)){
    // Invalid weather data object, shouldn't go in database.
    return {error: "Weather data must have a valid air temperature value."}
  }
  const result = await weather.insertOne(newObj);

  if(result.acknowledged){
    return { newObjectId: result.insertedId, message: `Item created! ID: ${result.insertedId}` }
  } else {
    return {error: "Something went wrong. Please try again."}
  }
}