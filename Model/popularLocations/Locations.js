const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    endpoint: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    discriptions: {
      type: String,
    },
    faq: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faqs",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const PopularLocations = model("popular-locations", schema);

module.exports = PopularLocations;
