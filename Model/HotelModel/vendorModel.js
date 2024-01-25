const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    img: String,
    kycVerified: {
      type: Boolean,
      default: false,
    },
    role: String,
    status: {
      type: Boolean,
    },
    password: String,
    hotels: [],
    // password secretkey to encode or decode
    secretKey: String,
    // password reset link
    resetLink: String,
    resetDateExpire: Date,

    // verify the email or number or kyc
    isNumberVarified: Boolean,
    isEmailVerified: Boolean,
    // account info
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "partners_bank_details",
    },
  },
  {
    timestamps: true,
  }
);

const VendorModel = mongoose.model("hotel-partners", schema);

module.exports = VendorModel;
