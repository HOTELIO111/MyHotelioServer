const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    dateOfCancellation: {
      type: Date,
      required: true,
    },
    deductionPercentage: {
      type: Number,
      default: 0,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "office", "admin"],
      default: "customer",
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "declined"],
      default: "pending",
    },
    refundMethod: {
      type: String,
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
