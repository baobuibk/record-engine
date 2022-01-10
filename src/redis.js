const redis = require("redis");
const client = redis.createClient();

const RecordDAO = require("./api/record.DAO");

client.on("connect", () => {
  console.log("redis client connect");
});

client.on("ready", () => {
  console.log("redis client ready");
});

client.on("reconnecting", (sth) => {
  console.log("redis client reconnecting", sth);
});

client.on("error", (error) => {
  console.error("redis client error", error);
});

client.on("end", (sth) => {
  console.error("redis client end", sth);
});

client.on("warning", (sth) => {
  console.error("redis client warning", sth);
});

client.on("subscribe", (channel, count) => {
  console.log("subscribe to channel '" + channel + "' with count: " + count);
});

client.on("message", function (channel, message) {
  console.log("received message in channel'" + channel + "': " + message);
});

client.on("psubscribe", (pattern, count) => {
  console.log("subscribe to pattern '" + pattern + "' with count: " + count);
});

client.on("pmessage", (pattern, channel, message) => {
  console.log("pattern '" + pattern + "' matched in channel'" + channel);

  const entityId = channel.split("/")[2];
  let { timestamp, data } = JSON.parse(message);

  for (const [key, value] of Object.entries(data)) {
    RecordDAO.addOneSample(entityId, key, { t: new Date(timestamp), v: value });
  }
});

client.psubscribe("context-broker/for-record-engine/*");

module.exports = client;
