const PORT = process.env.RECORD_ENGINE_PORT || 8001;
const DB_HOST = process.env.MONGO_HOST || "localhost";
const dbUri = "mongodb://" + DB_HOST + ":27017";
const dbName = process.env.DB_NAME || "record-engine";
const dbTimeout = Number(process.env.DB_TIMEOUT_MS) || 10000;

const httpServer = require("http").createServer(require("./app"));

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const redisUrl = "redis://" + REDIS_HOST + ":6379";
const { createClient } = require("redis");
const redisClient = createClient({ url: redisUrl });
redisClient.on("connect", () => console.log("redis client connect"));
redisClient.connect();
const { IoTConsumer } = require("node-iot-lib");
const consumer = new IoTConsumer(redisClient);

const Record = require("./DAOs/record.DAO");

async function main() {
  await require("./db")(dbUri, dbName, dbTimeout);
  console.log("mongodb connect");

  consumer.pSubscribe(`telemetry*`, async (message, channel) => {
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
