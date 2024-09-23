const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    message: {
      type: String,
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    valueOfMoney: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    cleanliness: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    comfort: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    timeline: {
      type: Boolean,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
    },
  },
  {
    timestamps: true,
  }
);

const ReviewsModel = model("reviews", schema);

module.exports = ReviewsModel;
