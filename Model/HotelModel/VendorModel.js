const mongoose = require("mongoose")

const schema = new mongoose.Schema({
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
    verified: Boolean,
    role: String,
    aadharNo: {
        type: Number,
    },
    panNo: {
        type: String,
    },
    // document upload 
    panImg: {
        type: String,
    },
    aadharImg: [],
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
    aadharVerify: String,
    panVerify: String,
    emailVerify: String
}, {
    timestamps: true
})



const VendorModel = mongoose.model("hotel-partners", schema);

module.exports = VendorModel;
