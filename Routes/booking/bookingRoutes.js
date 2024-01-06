const {
  RegisterBooking,
  CancleBooking,
  GetBookings,
  GetDeleteBooking,
  generateBookingId,
  CreatePreBooking,
  // UpdatePreBooking,
  ConfirmBookingPayAtHotel,
  CollectPaymentInfoAndConfirmBooking,
  ManageCancelBooking,
} = require("../../Controllers/booking/bookingController");
const {
  CheckBookingAvailability,
} = require("../../helper/booking/bookingHelper");
const ValidateBookingQuery = require("../../validator/booking/Booking");
const ValidatePaymentData = require("../../validator/booking/UpdateBookingPayment");

const router = require("express").Router();

// generatet booking id
router.get("/booking/generate", generateBookingId);

// create the pending booking and hold the room for the customer
router.post("/create/pre-booking", ValidateBookingQuery, CreatePreBooking);
// router.post("/create/booking/:id", UpdatePreBooking);
// collect the payment and complete the booking
router.post(
  "/booking/final/:paymentType",
  ValidatePaymentData,
  CollectPaymentInfoAndConfirmBooking
);
// Book the payat hotel room
router.post("/booking/pay-at-hotel", ConfirmBookingPayAtHotel);

// cancel Booking
router.get("/cancel-bookings", ManageCancelBooking);

// create the booking
router.post("/create", CheckBookingAvailability, RegisterBooking);

// cancel booking
router.get("/cancel", CancleBooking);

router.get("/get-booking", GetBookings);

// delete all the booking
router.get("/delete", GetDeleteBooking);

module.exports = router;
