const {
  FindHotelsAddedByCount,
  AdminHotelInfo,
  BookingAnalyticsAdmin,
  Last30DaysBookingsAdmin,
  GetUsersAndBookingInfo,
  GetDashboardHotelAndBookingInfo,
} = require("../../Controllers/Analytics/adminAnalytics");

const router = require("express").Router();

// get partner hotel and own hotel
router.get("/hotel-added-by", FindHotelsAddedByCount);
router.get("/hotel-info", AdminHotelInfo);
router.get("/booking-info", BookingAnalyticsAdmin);
router.get("/booking-graph/last-30-days", Last30DaysBookingsAdmin);
router.get("/dashboard/info/users", GetUsersAndBookingInfo);
router.get("/dashboard/info/booking", GetDashboardHotelAndBookingInfo);

module.exports = router;
