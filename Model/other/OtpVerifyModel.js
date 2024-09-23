const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    otpKey: String,
    otp: String,
    otpExpiresTime: Date,
    numberVerified: String,
    verified: String,
}, {
    timestamps: true
})


const OtpModel = mongoose.model("Otp-Used", schema);


module.exports = OtpModel;