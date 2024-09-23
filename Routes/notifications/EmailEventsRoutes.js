const {
  CreateEventNotification,
  CreateEmailTemplate,
  UpdateEmailTemplates,
  GetAllEmailTemplates,
  DeleteEmailTemplates,
  CreateSmsTemplate,
  GetSmsTemplate,
  DeleteSMSTemplate,
  UpdateSmsTemplate,
  GetNotificationsEvents,
  UpdateNotificationEvents,
  DeleteNotificationEvents,
  TestingNotificationQUeue,
  TestingNotificationQueue,
} = require("../../Controllers/notifications/notificationEventControllers");
const {
  EmailEventAddValidator,
  EmailTemplateValidate,
  SmsTemplateValidate,
} = require("../../validator/notification/emailEvents");

const router = require("express").Router();

router.post(
  "/email-events/create",
  EmailEventAddValidator,
  CreateEventNotification
);
router.put(
  "/email-events/update/:id",
  EmailEventAddValidator,
  UpdateNotificationEvents
);
router.get("/email-events/get", GetNotificationsEvents);
router.delete("/email-events/delete", DeleteNotificationEvents);

// create email Template
router.post(
  "/email-template/create",
  EmailTemplateValidate,
  CreateEmailTemplate
);
router.get("/email-template/get", GetAllEmailTemplates);
router.put(
  "/email-template/update/:id",
  EmailTemplateValidate,
  UpdateEmailTemplates
);
router.delete("/email-template/delete/:id", DeleteEmailTemplates);

// create Mobile Notification Template

router.post("/mobile-template/create", SmsTemplateValidate, CreateSmsTemplate);
router.get("/mobile-template/get", GetSmsTemplate);
router.put(
  "/mobile-template/update/:id",
  SmsTemplateValidate,
  UpdateSmsTemplate
);
router.delete("/mobile-template/delete/:id", DeleteSMSTemplate);

// testing api
router.get("/sendingEvent/test/:eventId", TestingNotificationQueue);

module.exports = router;
