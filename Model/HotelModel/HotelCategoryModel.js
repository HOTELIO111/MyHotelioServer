const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    filter: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const HotelCategoryModel = model("hotel_filter_categories", schema);

module.exports = HotelCategoryModel;
