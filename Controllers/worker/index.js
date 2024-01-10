const { Worker } = require("bullmq");
const { CreatePreBooking } = require("./BookingWorker");
const { EmailWorker } = require("./EmailNotification");
const RefundWorker = require("./RefundsWorker");

// quer workers
new Worker("booking", CreatePreBooking);
new Worker("Email-Notification", EmailWorker);
new Worker("Refunds", RefundWorker);
