const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const uri =
  "mongodb+srv://cherrypop:cherrypopper@cluster0-5vn2s.mongodb.net/landmarkData?retryWrites=true&w=majority";

// variable that initializes if database is connected
let _db;

// initDb is a function that initializes the database to _db if _db is empty.
const initDb = callback => {
  if (_db) {
    console.log("Database is already connected!");
    return callback(null, _db);
  }

  mongoClient
    .connect(uri)
    .then(client => {
        _db = client;
        callback(null, _db);
    })
    .catch(err => {
      console.log(err);
      callback(err);
    });
};

const getDb = () => {
    if (!_db) {
        throw Error("Database not initalized");        
    }
    return _db;
}

module.exports = {
    initDb,
    getDb
}