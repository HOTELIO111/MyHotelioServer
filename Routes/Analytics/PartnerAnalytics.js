const {
  PartnerHotelsInfo,
  DashboardCountings,
  HotelroomInfoAnalytics,
  BookingAnalyticsPartner,
  HotelRoomInfoByDateAnalytics,
} = require("../../Controllers/Analytics/partnerAnalytics");

const router = require("express").Router();

router.get("/hotel/info/:id", PartnerHotelsInfo);
router.get("/hotel/dashboard/counts/:vendorid", DashboardCountings);
router.get("/hotel-room-info/:vendorid", HotelroomInfoAnalytics);
router.get("/booking-info/:vendorid", BookingAnalyticsPartner);
router.get("/hotel-room-info/bydate/:vendorid", HotelRoomInfoByDateAnalytics);

module.exports = router;
