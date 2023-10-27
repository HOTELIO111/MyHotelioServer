const {
  RegisterBooking,
  CancleBooking,
  GetBookings,
} = require("../../Controllers/booking/bookingController");
const {
  CheckBookingAvailability,
} = require("../../helper/booking/bookingHelper");

const router = require("express").Router();

// create the booking
router.post("/create", CheckBookingAvailability, RegisterBooking);
// cancel booking
router.get("/cancel", CancleBooking);

router.get("/get-booking", GetBookings);

module.exports = router;
