const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    vendorId: String,
    name: String,
    email: String,
    aadharNo: String,
    panNo: String,
    aadharImg: [],
    panImg: String,
    isVerified: {
      type: String,
      default: "requested",
      enum: ["requested", "approved", "failed"],
    },
  },
  {
    timestamps: true,
  }
);

const KycModel = model("Kyc-requests", schema);

module.exports = KycModel;
