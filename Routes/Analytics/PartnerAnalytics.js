const {
  PartnerHotelsInfo,
  DashboardCountings,
} = require("../../Controllers/Analytics/partnerAnalytics");

const router = require("express").Router();

router.get("/hotel/info/:id", PartnerHotelsInfo);
router.get("/hotel/dashboard/counts/:vendorid", DashboardCountings);

module.exports = router;
