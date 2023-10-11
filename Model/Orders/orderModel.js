const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    bookingId: String,
    roomDetails: Object,
    hotelDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
    },
    bookingDate: {
      checkIn: {
        type: Date,
      },
      checkOut: {
        type: Date,
      },
    },
    numberOfRooms: Number,
    amount: String,
    discountCoupons: {
      type: String,
      default: "No coupon",
    },
    dateOfBooking: String,
    paymentStatus: {
      type: String,
      enum: ["pay at hotel", "success", "part pay"],
      default: "success",
    },
    paymentMethod: {
      type: String,
    },
    paymentDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const BookingModel = mongoose.model("bookings", schema);

module.exports = BookingModel;
