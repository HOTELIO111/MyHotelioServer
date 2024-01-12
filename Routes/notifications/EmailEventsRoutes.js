const {
  CreateEventNotification,
} = require("../../Controllers/notifications/notificationEventControllers");
const {
  EmailEventAddValidator,
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

module.exports = router;
