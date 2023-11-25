const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    avatar: {
      type: String,
    },
    name: {
      type: String,
      reqired: true,
    },
    message: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
      default: 5,
    },
    valueOfMoney: {
      type: Number,
      default: 4,
      enum: [0, 1, 2, 3, 4, 5],
    },
    cleanliness: {
      type: Number,
      default: 4,
      enum: [0, 1, 2, 3, 4, 5],
    },
    comfort: {
      type: Number,
      default: 4,
      enum: [0, 1, 2, 3, 4, 5],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers",
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
    },
  },
  {
    timestamps: true,
  }
);

const ReviewsModel = model("reviews", schema);

module.exports = ReviewsModel;
