const NotificationSystem = require("../../../Controllers/notifications/newNotifications/NotificationSystem");

require("dotenv").config();

const NotificationsQueue = async (job) => {
  console.log(job.data);
  const notifiy = await NotificationSystem.ManageNotification({
    data: job.data.data,
    eventId: job.data.eventId,
  });
};

module.exports = NotificationsQueue;
