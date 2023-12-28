const { Queue } = require("bullmq");
const redisConnection = require("../config/redisConnection");

const BookingQue = new Queue("booking", { connection: redisConnection });

module.exports = { BookingQue };
