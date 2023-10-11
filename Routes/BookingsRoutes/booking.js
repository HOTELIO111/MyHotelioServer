const {
  CreateBooking,
  GetBooking
} = require("../../Controllers/bookingsControllers.js/bookingControllers");

const router = require("express").Router();

// register the booking

router.post("/create", CreateBooking);
router.get('/get-booking' , GetBooking)

module.exports = router;
