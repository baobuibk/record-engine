const { MongoClient } = require("mongodb");

const RecordDAO = require("./DAOs/record.DAO");

let db;

module.exports = async (dbUri, dbName, timeout) => {
  if (!db) {
    let client = new MongoClient(dbUri, { serverSelectionTimeoutMS: timeout });
    await client.connect();
    db = client.db(dbName);
    await RecordDAO.init(db);
  }
};
