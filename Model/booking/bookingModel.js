const mongoose = require("mongoose");

const discountInfo = new mongoose.Schema({
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

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
      mobileNo: Number,
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
      paymentType: {
        type: String,
        enum: ["part-pay", "online", "pay-at-hotel"],
        default: "online",
      },
      payments: [
        { type: mongoose.Schema.Types.ObjectId, ref: "paymentsresponses" },
      ],
      totalamount: {
        type: Number,
      },
      paidamount: {
        type: Number,
      },
      balanceAmt: {
        type: Number,
      },
    },
    specialRequests: String,
    bookingStatus: {
      type: String,
      enum: ["confirmed", "canceled", "pending", "failed"],
      default: "pending",
      required: true,
    },
    cancellationDueDate: {
      type: Date,
      required: true,
    },
    additionalCharges: {
      gst: Number,
      cancellationCharge: Number,
      serviceFee: Number,
    },
    promoCode: String,
    discountInfo: [discountInfo],
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
      // Status of the cancellation request
      status: {
        type: String,
        enum: ["requested", "approved", "pending", "rejected", "canceled"],
      },
      // Customer who initiated the cancellation request
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      // Date when the cancellation was requested
      requestedDate: {
        type: Date,
      },
      // Reason provided for the cancellation
      reason: {
        type: String,
      },
      // Additional notes or comments related to the cancellation
      notes: {
        type: String,
      },
      // Refund amount when the cancellation is approved
      refundAmount: {
        type: Number,
        // Store the refund amount when a cancellation is approved
      },
    },
    refunds: {
      // Total amount of the transaction
      amount: {
        type: Number,
      },
      // Amount that has been refunded
      refunded: {
        type: Number,
      },
      // Date when the cancellation and refund were processed
      dateofCancel: {
        type: Date,
      },
      // Percentage of the refund amount that was deducted, if any
      deductedPercentage: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
