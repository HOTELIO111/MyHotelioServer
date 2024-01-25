const {
  PartnerHotelsInfo,
} = require("../../Controllers/Analytics/partnerAnalytics");

const router = require("express").Router();

router.get("/hotel/info/:id", PartnerHotelsInfo);

module.exports = router;
