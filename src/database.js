const { MongoClient } = require("mongodb");

const RecordDAO = require("./api/record.DAO");

let mongoClient;
let db;

const database = {
  connect: async (dbUri) => {
    if (!mongoClient) {
      mongoClient = new MongoClient(dbUri, { serverSelectionTimeoutMS: 10000 });

      await mongoClient.connect();
      console.log("mongodb client connect");
    }
  },

  init: async (dbName) => {
    if (!db) {
      db = mongoClient.db(dbName);

      await RecordDAO.init(db);
      console.log("mongodb database init");
    }
  },
};

module.exports = database;
