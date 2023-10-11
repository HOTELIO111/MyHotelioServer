const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    id: String,
    seq: Number,
  },
  {
    timestamps: true,
  }
);

const BookingSequence = model("booking-id", schema);

module.exports = BookingSequence;
