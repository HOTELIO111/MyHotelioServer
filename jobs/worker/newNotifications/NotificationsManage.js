const NotificationSystem = require("../../../Controllers/notifications/newNotifications/NotificationSystem");
const { FindEventId } = require("../../../config/notificationEvents");

require("dotenv").config();

const NotificationsQueue = async (job) => {
  const eventCode = job.data.eventId;
  console.log(eventCode);
  let eventId = await FindEventId(eventCode);
  if (eventId.error) return { error: true, message: eventId.message };
  console.log(job.data.data);
  await NotificationSystem.ManageNotification({
    data: job.data.data,
    eventId: eventId.data,
  });
};

module.exports = NotificationsQueue;
