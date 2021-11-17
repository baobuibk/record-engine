const redis = require("redis");
const client = redis.createClient();

const recordDAO = require("./api/record.DAO");

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

client.on("pmessage", function (pattern, channel, message) {
  console.log(
    "pattern '" + pattern + "' matched in channel'" + channel + "': " + message
  );

  const entityId = channel.split(".")[1];

  for (const [key, value] of Object.entries(JSON.parse(message))) {
    recordDAO.addOneSample(entityId, key, { t: new Date(), v: value });
  }
});

client.psubscribe("context-broker.*");

module.exports = client;
