const router = require("express").Router();
const PartnerAnalytics = require("./PartnerAnalytics");

router.use("/partner", PartnerAnalytics); 

module.exports = router;
