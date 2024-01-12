const AdminModel = require("../../../Model/AdminModel/adminModel");
require("dotenv").config();
const EmailEventModel = require("../../../Model/Notifications/EmailNotificationEvents");
const NotificationModel = require("../../../Model/Notifications/notificationModel");

const NotificationManager = async (data) => {
  const NotificationType = data?.data?.type;

  try {
    // when get the notification type lets find the Notrification Info
    const NotificationInfo = await EmailEventModel.findOne({
      eventId: NotificationType,
    });
    if (!NotificationInfo) {
      const admin = await AdminModel.findOne({});
      await SendInAppNotification([
        {
          sender: process.env.SERVER_NAME,
          title: "Server Issue",
          recipient: admin._id,
          message: `Server is trying to use unsupported Notification Event '${NotificationType}' ! please try to resolve it asap!`,
          notification_mood: "warning",
        },
      ]);
    }

    // Now  find the Notifcaion Event type from the database and follow the next steps 
  } catch (error) {}
};

module.exports = NotificationManager;

async function SendInAppNotification(array) {
  try {
    const registerinNotification = await NotificationModel.insertMany(array);
    if (registerinNotification) return true;
  } catch (error) {
    return false;
  }
}

// sender, reciepent, message, title
