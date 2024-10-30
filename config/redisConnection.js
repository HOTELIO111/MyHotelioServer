// redis-connection.js
const Redis = require("ioredis");

let redisConfig = process.env.REDIS_URL;

if (process.env.ENV !== "production") {
  redisConfig = {
    port: 6379,
    host: "127.0.0.1",
  };
}

const redisConnection = new Redis(redisConfig, { maxRetriesPerRequest: null });

redisConnection.on("connect", () => {
  console.log("Connected to Redis");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisConnection;
