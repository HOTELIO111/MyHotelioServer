const router = require("express").Router();
const EmailTemplateRoutes = require("./EmailEventsRoutes");
const {
  CreateNotification,
  GetRecipientNotification,
  GetDeleteAllTheNotification,
  GetDeleteNotificationByID,
  DeleteSingeVendorAllNotification,
  GetAllNotifications,
} = require("../../Controllers/notifications/notificationsControllers");

const NewNotifications = require("./New Notifications/notificationRoutes");

router.use("/events", EmailTemplateRoutes);
router.use("/new-notifications", NewNotifications);

// create a notification

router.get("/notification", CreateNotification);

// get through reciepientr
router.get("/notification/:recipient", GetRecipientNotification);

// delete the notification
router.get("/notification/delete/:id", GetDeleteNotificationByID);

// delete all notification as vendor

router.get("/notification/delete/vendor/id", DeleteSingeVendorAllNotification);

// get all the notifications

router.get("/notification/getall", GetAllNotifications);

//delete all notifications
router.get("/notification/deleteall", GetDeleteAllTheNotification);

module.exports = router;
