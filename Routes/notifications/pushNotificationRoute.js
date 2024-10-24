const {
  saveFcmToken,
} = require("../../Controllers/notifications/pushNotificationController");
const router = require("express").Router();
router.post("/save-fcmToken", saveFcmToken);
module.exports = router;
