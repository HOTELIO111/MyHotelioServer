const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    img: String,
  },
  {
    timestamps: true,
  }
);

const DynamicImgSlderModel = model("slider-img", schema);

module.exports = DynamicImgSlderModel;
