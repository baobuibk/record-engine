// const debug = require("debug")("ContextSubscriber");
const debug = console.log;
const { createClient } = require("redis");

class ContextSubscriber {
  client;
  constructor() {
    let client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    client.on("connect", () => debug("connect"));
    client.on("ready", () => debug("ready"));
    client.on("end", () => debug("end"));
    client.on("error", (error) => debug("error", error.message));
    client.on("reconnecting", () => debug("reconnecting"));
    client.connect();
    this.client = client;
  }

  subscribe(channel, callback) {
    this.client.subscribe(channel, callback);
  }
  pSubscribe(pattern, callback) {
    this.client.pSubscribe(pattern, callback);
  }
}

module.exports = ContextSubscriber;
