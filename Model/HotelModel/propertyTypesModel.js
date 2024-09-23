const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PropertyTypes = model("property-types", schema);

module.exports = PropertyTypes;
