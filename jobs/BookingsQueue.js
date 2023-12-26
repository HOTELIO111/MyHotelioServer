const { Queue } = require("bullmq");
const redisConnection = require("../config/redisConnection");

const BookingQue = new Queue("pre-booking", { connection: redisConnection });

module.exports = { BookingQue };
