const NotificationsEvents = require("../../../helper/notifications/NotificationSystem");

require("dotenv").config();

const NotificationManager = async (data) => {
  const notificationType = data.data.type;
  const fromdata = data.data;
  const notifier = new NotificationsEvents();

  switch (notificationType) {
    case "email":
      await notifier.SendEmailNotifications(
        fromdata?.recipient,
        fromdata?.subject,
        fromdata?.html,
        fromdata?.text,
        fromdata?.cc
      );
      break;
    case "inApp":
      await notifier.SendInAppNotification(
        fromdata?.subject,
        fromdata?.text,
        fromdata?.recipient,
        fromdata?.mood,
        fromdata?.sender
      );
      break;
    case "mobile":
      const sendit = await notifier.SendMobileNotifications(
        fromdata?.text,
        fromdata?.recipient
      );
      break;
    default:
      break;
  }
};
module.exports = NotificationManager;
