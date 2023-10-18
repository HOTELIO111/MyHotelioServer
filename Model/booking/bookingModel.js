const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: String,
    },
    numberOfRoom: {
      type: Number,
      default: 1,
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
        validate: {
          validator: function (checkOut) {
            return checkOut > this.bookingDate.checkIn;
          },
          message: "Check-out date must be after check-in date",
        },
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
    additionalCharges: {
      gst: Number,
      cancelationCharge: Number,
      serviceFee: Number,
    },
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
    cancellation: {
      status: {
        type: String,
        enum: ["requested", "approved", "pending", "rejected", "canceled"],
      },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      requestedDate: Date,
      reason: String,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      processedDate: Date,
      notes: String,
      refundAmount: Number, // Store the refund amount when a cancellation is approved
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
