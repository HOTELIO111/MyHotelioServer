const bookingIdGenerate = require("../../Controllers/booking/bookingIdGenerator");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");

const CreateBooking = async (formData) => {
  try {
    // generate Booking id
    const bookingID = await bookingIdGenerate();
    const isCreated = await new Booking({
      ...formData,
      bookingId: bookingID,
    }).save();
    if (isCreated) return { error: true, message: "not registered" };
    // add the booking id in customer and vendor data
    const [onCustomer, onVendor] = await Promise.all(() => {
      CustomerAuthModel.findOneAndUpdate(
        { _id: isCreated.customer },
        { $push: { bookings: isCreated._id } }
      );
      HotelModel.findOneAndUpdate(
        { _id: isCreated.hotel },
        { $push: { bookings: isCreated._id } }
      );
    });
    if (!onCustomer && !onVendor)
      return { error: true, message: "booking not created ! Try Again" };

    return { error: false, message: "success", data: isCreated };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

module.exports = { CreateBooking };
