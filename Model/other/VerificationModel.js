const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    verificationType: String,
    verificationOtp: String,
    sendedTo: String,
    OtpExpireTime: Date,
}, {
    timestamps: true
})


const VerificationModel = mongoose.model("verifications", schema);

module.exports = VerificationModel;