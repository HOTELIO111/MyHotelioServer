const router = require("express").Router();
const PartnerAnalytics = require("./PartnerAnalytics");
const AdminAnalyticsRoutes = require("./adminAnalyticsRoutes");

router.use("/partner", PartnerAnalytics);
router.use("/admin", AdminAnalyticsRoutes);

module.exports = router;
