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
  SendCustomBulkEmailNotification,
  GetAllTemplatesWithFilters,
  DeleteTheTemplateByid,
  UpdateThemTemplate,
  GetUserInappNotifications,
  ReadTheInAppNotifications,
  CreateInAppNotificationApi,
  GetALlInAppNotifications,
} = require("../../../Controllers/notifications/newNotifications/NotificationController");
const {
  CreateInAppNotificationValidate,
} = require("../../../validator/notification/InAppNotificatins");

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
router.get(
  "/notification-templates/get-with-filter",
  GetAllTemplatesWithFilters
);
router.delete("/notification-templates/delete", DeleteTheTemplateByid);
router.patch("/notifications-templates/update/:id", UpdateThemTemplate);

// ============================================================Create Tempaltes End ==================================================
router.post("/notification/send", sendNotification);

router.post("/notification-custom-bulk/email", SendCustomBulkEmailNotification);
// ===================================================In APP notifications =================================
router.post(
  "/app-notifications/create",
  CreateInAppNotificationValidate,
  CreateInAppNotificationApi
);
router.get("/app-notifications/:id", GetUserInappNotifications);
router.get("/app-notifications/read/:id", ReadTheInAppNotifications);
router.get("/app-notifications/get/all-notification", GetALlInAppNotifications);
module.exports = router;
