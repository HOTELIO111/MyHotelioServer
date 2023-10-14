const {
  RegisterBooking,
} = require("../../Controllers/booking/bookingController");

const router = require("express").Router();

// create the booking
router.post("/create", RegisterBooking);
// update the booking
router.post("/update");
// delete the booking
router.post("/create");

module.exports = router;
