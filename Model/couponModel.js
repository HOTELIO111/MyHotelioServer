const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    session: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    discriptions: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CouponModel = model("coupons_models", schema);

module.exports = CouponModel;
