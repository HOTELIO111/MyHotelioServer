const {
  PartnerHotelsInfo,
  DashboardCountings,
  HotelroomInfoAnalytics,
  BookingAnalyticsPartner,
} = require("../../Controllers/Analytics/partnerAnalytics");

const router = require("express").Router();

router.get("/hotel/info/:id", PartnerHotelsInfo);
router.get("/hotel/dashboard/counts/:vendorid", DashboardCountings);
router.get("/hotel-room-info/:vendorid", HotelroomInfoAnalytics);
router.get("/booking-info/:vendorid", BookingAnalyticsPartner);

module.exports = router;
