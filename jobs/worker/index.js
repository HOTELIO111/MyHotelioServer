const { Worker } = require("bullmq");
const { CreatePreBooking } = require("./BookingWorker");
const RefundWorker = require("./RefundsWorker");
const NotificationManager = require("./Notifications/InAppNotification");
const EmailWorker = require("./Notifications/EmailNotification");
const NotificationsQueue = require("./newNotifications/NotificationsManage");
const redisConnection = require("../../config/redisConnection");

// quer workers
new Worker("booking", CreatePreBooking, { connection: redisConnection });
new Worker("Email-Notification", EmailWorker, { connection: redisConnection });
new Worker("Refunds", RefundWorker, { connection: redisConnection });
new Worker("notification-manager", NotificationManager, {
  connection: redisConnection,
});
new Worker("notification-management", NotificationsQueue, {
  connection: redisConnection,
});
