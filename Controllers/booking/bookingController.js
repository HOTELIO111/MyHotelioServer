const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");
const {
  CreateBooking,
  handleCancelationPolicy,
  CancelBooking,
} = require("../../helper/booking/bookingHelper");

const RegisterBooking = async (req, res) => {
  const formData = req.body;

  try {
    const booknow = await CreateBooking(formData);

    if (booknow.error === true) return res.status(400).json(booknow);
    res.status(200).json(booknow);
  } catch (error) {
    res.status(500).json({ errro: true, message: error.message });
  }
};

// cancel booking
const CancleBooking = async (req, res) => {
  const { request, bookingId } = req.query;
  try {
    const bookingTime = await CancelBooking(bookingId, request);

    res.status(200).json(bookingTime);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Get all the booking
const GetBookings = async (req, res) => {
  const queryFields = req.query;

  try {
    let filter = {}; // Initialize an empty filter object

    // Check if there are any fields in req.query with values
    for (const field in queryFields) {
      if (queryFields[field]) {
        filter[field] = queryFields[field];
      }
    }

    let response;

    if (Object.keys(filter).length > 0) {
      // If filter has fields, use it to filter the results
      response = await Booking.find(filter);
    } else {
      // If no specific fields are provided, fetch all data
      response = await Booking.find({});
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const GetDeleteBooking = async (req, res) => {
  const { id } = req.query;
  const credentials = id ? { _id: id } : {};

  try {
    const response = await Booking.deleteMany(credentials);
    if (response) {
      HotelModel.updateMany({ bookings: [] });
      CustomerAuthModel.updateMany({ bookings: [] });
      res.status(200).json("every data deleted");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  RegisterBooking,
  CancleBooking,
  GetBookings,
  GetDeleteBooking,
};
