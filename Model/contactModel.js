const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    disc: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      enum: ["requested", "pending", "resolved"],
      default: "requested",
    },
  },
  {
    timestamps: true,
  }
);

const ContactUsModel = model("contact_us_datas", schema);

module.exports = ContactUsModel;
