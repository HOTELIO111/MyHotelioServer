const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: String,
      required: function () {
        return this.isPaid === true;
      },
    },
  },
  {
    timestamps: true,
  }
);

const FacilitiesModel = model("facilities", schema);

module.exports = FacilitiesModel;
