const {
  CreateEventNotification,
  CreateEmailTemplate,
  UpdateEmailTemplates,
  GetAllEmailTemplates,
  DeleteEmailTemplate,
  DeleteEmailTemplates,
} = require("../../Controllers/notifications/notificationEventControllers");
const {
  EmailEventAddValidator,
  EmailTemplateValidate,
} = require("../../validator/notification/emailEvents");

const router = require("express").Router();

router.post(
  "/email-events/create",
  EmailEventAddValidator,
  CreateEventNotification
);
router.post("/email-events/update");
router.post("/email-events/get");
router.post("/email-events/delete");

// create email Template
router.post(
  "/email-template/create ",
  EmailTemplateValidate,
  CreateEmailTemplate
);
router.get("/email-template/get", GetAllEmailTemplates);
router.put(
  "/email-template/update:id ",
  EmailTemplateValidate,
  UpdateEmailTemplates
);
router.delete("/email-template/delete/:id ", DeleteEmailTemplates);

// create Mobile Notification Template

router.post("/mobile-template/create");
router.get("/mobile-template/get");
router.put("/mobile-template/update/:id");
router.delete("/mobile-template/delete/:id");

module.exports = router;
