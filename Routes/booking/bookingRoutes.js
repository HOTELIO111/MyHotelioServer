const {
  RegisterBooking,
  CancleBooking,
  GetBookings,
  GetDeleteBooking,
  generateBookingId,
  CreatePreBooking,
} = require("../../Controllers/booking/bookingController");
const {
  CheckBookingAvailability,
} = require("../../helper/booking/bookingHelper");
const PreBooking = require("../../validator/booking/PreBooking");

const router = require("express").Router();

// generatet booking id
router.get("/booking/generate", generateBookingId);

router.post("/create/pre-booking", PreBooking, CreatePreBooking);
// create the booking
router.post("/create", CheckBookingAvailability, RegisterBooking);
// cancel booking
router.get("/cancel", CancleBooking);

router.get("/get-booking", GetBookings);

// delete all the booking
router.get("/delete", GetDeleteBooking);

module.exports = router;
