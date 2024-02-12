const { Worker } = require("bullmq");
const { CreatePreBooking } = require("./BookingWorker");
const RefundWorker = require("./RefundsWorker");
const NotificationManager = require("./Notifications/InAppNotification");
const EmailWorker = require("./Notifications/EmailNotification");

// quer workers
new Worker("booking", CreatePreBooking);
new Worker("Email-Notification", EmailWorker);
new Worker("Refunds", RefundWorker);
new Worker("notification-manager", NotificationManager);
