const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: String,
    room: {
      type: String,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
      required: true,
    },
    guest: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phoneNumber: String,
    },
    bookingDate: {
      checkIn: {
        type: Date,
        required: true,
      },
      checkOut: {
        type: Date,
        required: true,
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    dateOfBooking: {
      type: Date,
      required: true,
    },
    payment: {
      status: {
        type: String,
        enum: ["success", "pending", "failed"],
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
      transactionID: String,
      confirmationNumber: String,
      date: Date,
    },
    specialRequests: String,
    bookingStatus: {
      type: String,
      enum: ["confirmed", "canceled", "pending"],
      default: "pending",
      required: true,
    },
    additionalCharges: Number,
    promoCode: String,
    discountAmount: Number,
    numberOfGuests: {
      adults: {
        type: Number,
        required: true,
      },
    },
    numberOfRooms: Number,
    bookingSource: String,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers", // Reference to the User model if users are registered
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
