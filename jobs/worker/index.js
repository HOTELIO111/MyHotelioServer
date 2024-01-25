const { Worker } = require("bullmq");
const { CreatePreBooking } = require("./BookingWorker");
const { EmailWorker } = require("./Notifications/EmailNotification");
const RefundWorker = require("./RefundsWorker");
const NotificationManager = require("./Notifications/InAppNotification");

// quer workers
new Worker("booking", CreatePreBooking);
new Worker("Email-Notification", EmailWorker);
new Worker("Refunds", RefundWorker);
new Worker("notification-manager", NotificationManager);
