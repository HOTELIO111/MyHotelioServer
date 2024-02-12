// redis-connection.js
const Redis = require("ioredis");

// const redisConfig = "rediss://default:AVNS_nKlMYE9iA7v5NBsgR2Y@redis-da7f14e-hotelio.a.aivencloud.com:26737"
const redisConfig = {
  port: 6379,
  host: "127.0.0.1",
};

const redisConnection = new Redis(redisConfig);

module.exports = redisConnection;
