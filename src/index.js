require("dotenv").config();

const PORT = process.env.PORT || 8000;
const dbUri = process.env.DB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "record-engine";
const dbTimeout = Number(process.env.DB_TIMEOUT_MS) || 10000;

const httpServer = require("http").createServer(require("./app"));

const ContextSubscriber = require("./ContextSubscriber");
const conSub = new ContextSubscriber();
const Record = require("./DAOs/record.DAO");

async function main() {
  await require("./db")(dbUri, dbName, dbTimeout);
  console.log("mongodb connect");

  conSub.pSubscribe(`telemetry*`, async (message, channel) => {
    try {
      const [_, entityId, field] = channel.split(".");
      const { value, timestamp } = JSON.parse(message);
      const result = await Record.insertOne(entityId, field, value, timestamp);
      console.log(result);
    } catch (error) {
      console.log(error.message);
    }
  });

  httpServer.listen(PORT, () =>
    console.log("server is listening on port", PORT)
  );
}

main().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
