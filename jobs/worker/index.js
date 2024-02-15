const { Worker } = require("bullmq");
const { CreatePreBooking } = require("./BookingWorker");
const RefundWorker = require("./RefundsWorker");
const NotificationManager = require("./Notifications/InAppNotification");
const EmailWorker = require("./Notifications/EmailNotification");
const NotificationsQueue = require("./newNotifications/NotificationsManage");

// quer workers
new Worker("booking", CreatePreBooking);
new Worker("Email-Notification", EmailWorker);
new Worker("Refunds", RefundWorker);
new Worker("notification-manager", NotificationManager);
new Worker("notification-management", NotificationsQueue);
