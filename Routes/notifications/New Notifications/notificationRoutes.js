const {
  AddEventInList,
  GetAllEvents,
  RegisterNotificationEvent,
  GetNotificationEvent,
  RegisterNotification,
  GetTempalates,
  sendNotification,
  UpdateNotificationEvent,
  UpdateStatusNotificationEvent,
} = require("../../../Controllers/notifications/newNotifications/NotificationController");

const router = require("express").Router();

router.post("/event/add/:eventname", AddEventInList);
router.get("/event/get", GetAllEvents);

// ===================================================== EventList End =============================================================

// ==================================================== Notification events =======================================================

router.post("/notification-event/create", RegisterNotificationEvent);
router.get("/notification-event/getall", GetNotificationEvent);
router.patch("/notification-event/update/:id", UpdateNotificationEvent);
router.get(
  "/notification-event/update-status/:id",
  UpdateStatusNotificationEvent
);

// ===================================================== Notification Events End ==================================================

// =====================================================Create Templates ======================================================

router.post("/notification-templates/create", RegisterNotification);
router.get("/notification-templates/get", GetTempalates);
router.get("/notification-templates/get-with-filter");
router.delete("/notification-templates/delete/:id");
router.patch("/notifications-templates/update/:id");

// ============================================================Create Tempaltes End ==================================================
router.post("/notification/send", sendNotification);
module.exports = router;
