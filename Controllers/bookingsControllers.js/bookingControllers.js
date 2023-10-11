const BookingModel = require("../../Model/Orders/orderModel");
const { GetTheBookings } = require("../../helper/bookings/bookinghelpers");
const GenerateBookingId = require("../Others/BookingId");

const CreateBooking = async (req, res) => {
  const formData = req.body;
  try {
    // create the booking
    const bookingId = await GenerateBookingId();
    const data = new BookingModel({
      ...formData,
      bookingId: bookingId,
    });
    await data.save();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

const GetBooking = async (req, res) => {
  const { id, populated } = req.query;
  try {
    const data = await GetTheBookings({ id, populated });
    if (!data) return res.status({ error: true, message: "no data found" });
    res.status(200).json({ error: false, message: "success", data: data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { CreateBooking, GetBooking };
