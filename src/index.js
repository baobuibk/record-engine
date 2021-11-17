const http = require("http");

const database = require("./database");
const expressApp = require("./express");

async function main() {
  const DB_URI = process.env.DB_URI || "mongodb://localhost:27017";
  await database.connect(DB_URI);
  const DB_NAME = process.env.DB_NAME;
  await database.init(DB_NAME);

  const redisClient = require("./redis");

  const httpServer = http.createServer(expressApp);
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log("http server is listening on port", PORT);
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
