const { Queue } = require("bullmq");
const redisConnection = require("../config/redisConnection");

const BookingQue = new Queue("booking", { connection: redisConnection });

const MobileNotification = new Queue("mobile-notification", {
  connection: redisConnection,
});

const EmailNotification = new Queue("Email-Notification", {
  connection: redisConnection,
});
module.exports = { BookingQue, MobileNotification, EmailNotification };
