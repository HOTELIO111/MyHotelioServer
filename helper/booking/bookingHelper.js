const bookingIdGenerate = require("../../Controllers/booking/bookingIdGenerator");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");

const CreateBooking = async (formData) => {
  try {
    // Generate Booking id
    const bookingID = await bookingIdGenerate();
    const isCreated = await new Booking({
      ...formData,
      bookingId: bookingID,
    }).save();
    if (!isCreated) return { error: true, message: "Not registered" };

    // Add the booking id in customer and vendor data
    const [onCustomer, onVendor] = await Promise.all([
      CustomerAuthModel.findOneAndUpdate(
        { _id: isCreated.customer },
        { $push: { bookings: isCreated._id } }
      ),
      HotelModel.findOneAndUpdate(
        { _id: isCreated.hotel },
        { $push: { bookings: isCreated._id } }
      ),
    ]);

    if (!onCustomer && !onVendor)
      return { error: true, message: "Booking not created! Try Again" };

    return { error: false, message: "Success", data: isCreated };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const CheckBookingAvailability = async (req, res, next) => {
  try {
    const data = req.body;
    const checkIn = new Date(data.bookingDate.checkIn);
    const checkOut = new Date(data.bookingDate.checkOut);

    const bookingsWithinDateRange = await Booking.find({
      room: data.room,
      hotel: data.hotel,
      bookingStatus: "confirmed",
      $or: [
        {
          "bookingDate.checkIn": { $gte: checkIn, $lte: checkOut },
        },
        {
          "bookingDate.checkOut": { $gte: checkIn, $lte: checkOut },
        },
      ],
    }).populate({
      path: "hotel customer",
    });
    //  total rooms used
    const usedRooms = bookingsWithinDateRange
      .map((x) => x.numberOfRoom)
      .reduce((a, b) => a + b, 0);

    // check in the room
    const hotelData = await HotelModel.findOne({
      _id: data.hotel,
      rooms: {
        $elemMatch: {
          _id: data.room,
          counts: { $gte: usedRooms + data.numberOfRooms },
        },
      },
    }).populate("rooms.roomType");

    if (!hotelData)
      return res
        .status(404)
        .json({ error: true, message: "Room not Available" });

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Handle booking cancellation policy
const handleCancellationPolicy = async (bookingId) => {
  const booking = await Booking.findOne({ bookingId: bookingId });

  if (!booking) {
    return "Booking not found.";
  }

  const roomsBooked = booking.numberOfRooms;

  // Check cancellation policy and apply refund policy
  const currentDate = new Date();

  const bookingDate = booking?.bookingDate?.checkIn;
  const difference = bookingDate - currentDate;
  const hoursDifference = difference / (1000 * 3600);

  const sumOfAdditionalCharges = Object.values(
    booking.additionalCharges
  ).reduce((a, b) => a + b, 0);

  const refund =
    parseFloat(booking.amount) - parseFloat(sumOfAdditionalCharges);
  return sumOfAdditionalCharges;
};

// Cancellation booking
const CancelBooking = async (bookingId, request) => {
  try {
    // Get booking
    const isBooking = await Booking.findOne({ bookingId: bookingId });
    if (!isBooking)
      return { error: true, message: "No booking found with this id" };

    // Make the refund policy
    const timeDifferenceFromBooking = await handleCancellationPolicy(bookingId);
    return timeDifferenceFromBooking;
    // -------------------------working on this ------------------------------
  } catch (error) {
    return error;
  }
};


module.exports = {
  CreateBooking,
  CheckBookingAvailability,
  handleCancellationPolicy,
  CancelBooking,
};
