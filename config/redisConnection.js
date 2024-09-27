// redis-connection.js
const Redis = require("ioredis");

let redisConfig =
  "redis://default:hooxrdnjAjGfazS0izbh587AiOlfrqwa@redis-14012.c257.us-east-1-3.ec2.redns.redis-cloud.com:14012";

if (process.env.ENV !== "production") {
  redisConfig = {
    port: 6379,
    host: "127.0.0.1",
  };
}

const redisConnection = new Redis(redisConfig);

redisConnection.on("connect", () => {
  console.log("Connected to Redis");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisConnection;
