const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
    },
    personAllowed: {
      type: Number,
      default: 4,
    },
    includeFacilities: [{ type: Schema.Types.ObjectId, ref: "facilities" }],
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    amenties: [{ type: Schema.Types.ObjectId, ref: "amenities" }],
  },
  {
    timestamps: true,
  }
);

const RoomsTypeModel = model("room-category", schema);

module.exports = RoomsTypeModel;
