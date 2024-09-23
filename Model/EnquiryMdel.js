const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      default: "requested",
      enum: ["requested", "pending", "joined", "not-interested"],
    },
  },
  {
    timestamps: true,
  }
);

const EnquiryModel = model("enquiry-datas", schema);

module.exports = EnquiryModel;
