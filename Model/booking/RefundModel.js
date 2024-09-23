const mongoose = require("mongoose");

// const schema = new mongoose.Schema(
//   {
//     totalRefundAmount: {
//       type: Number,
//       default: 0,
//     },
//     refundPolicyPercentage: {
//       type: Number,
//       default: 0,
//     },
//     dateOfCancellation: {
//       type: Date,
//       required: true,
//     },
//     bookingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "bookings",
//     },
//     notes: {
//       type: String,
//     },
//     refundReason: {
//       type: String,
//     },
//     refundApproval: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

const refundSchema = new mongoose.Schema(
  {
    totalBookingAmount: {
      type: Number,
      required: true,
    },
    refundableAmount: {
      type: Number,
      default: 0,
    },
    bookingid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
    },
    dateOfCancellation: {
      type: Date,
      required: true,
    },
    policyDeductPercentage: {
      type: Number,
      default: 0,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "office", "admin"],
      default: "customer",
    },
    refundResultInfo: {
      type: String,
    },
    refundApproval: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "in-process", "declined", "success"],
      default: "pending",
    },
    paymentDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const RefundModel = mongoose.model("refunds", refundSchema);

module.exports = RefundModel;
