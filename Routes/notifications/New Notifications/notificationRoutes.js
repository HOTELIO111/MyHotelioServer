const {
  AddEventInList,
  GetAllEvents,
  RegisterNotificationEvent,
  GetNotificationEvent,
  RegisterNotification,
  GetTempalates,
  sendNotification,
} = require("../../../Controllers/notifications/newNotifications/NotificationController");

const router = require("express").Router();

router.post("/event/add/:eventname", AddEventInList);
router.get("/event/get", GetAllEvents);

// ===================================================== EventList End =============================================================

// ==================================================== Notification events =======================================================

router.post("/notification-event/create", RegisterNotificationEvent);
router.get("/notification-event/getall", GetNotificationEvent);

// ===================================================== Notification Events End ==================================================

// =====================================================Create Templates ======================================================

router.post("/notification-templates/create", RegisterNotification);
router.get("/notification-templates/get", GetTempalates);

// ============================================================Create Tempaltes End ==================================================
router.post("/notification/send", sendNotification);
module.exports = router;
