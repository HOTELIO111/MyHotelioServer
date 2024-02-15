const NotificationSystem = require("../../../Controllers/notifications/newNotifications/NotificationSystem");
const AdminModel = require("../../../Model/AdminModel/adminModel");
const VendorModel = require("../../../Model/HotelModel/vendorModel");

require("dotenv").config();

const NotificationsQueue = async (job) => {
  const notifiy = await NotificationSystem.ManageNotification({
    data: job.data.data,
    eventId: job.data.eventId,
  });
};

module.exports = NotificationsQueue;
