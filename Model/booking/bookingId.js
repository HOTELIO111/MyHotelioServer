const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: String,
    seq: Number,
  },
  {
    timestamps: true,
  }
);

const BookingID = mongoose.model("booking-id", schema);

module.exports = BookingID;
