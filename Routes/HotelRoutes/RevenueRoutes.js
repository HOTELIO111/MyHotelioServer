const {
  getRevenueReportByHotel,
  getRevenueReportByHotelPartner,
} = require("../../Controllers/RevenueReportControllers/RevenueReportController");

const router = require("express").Router();

router.get("/revenueByHotel/:hotelId", getRevenueReportByHotel);
router.get(
  "/revenueByHotelPartner/:hotelPartnerId",
  getRevenueReportByHotelPartner
);

module.exports = router;
