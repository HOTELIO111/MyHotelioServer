const { string } = require("joi");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    avatar: {
        type: String,
    },
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
    },
    mobileNo: {
        type: String,
    },
    location: {
        lang: String,
        lat: String
    },
    password: {
        type: String,
    },
    googleId: {
        type: String
    },
    isVerified: {
        type: Array,
    },
    birthday: Date,
    address: String,
    gender: String,
    maritialStatus: String,
    state: String,
    pinCode: String,
    resetLink: String,
    resetDateExpires: Date,
    secretKey: String,
}, {
    timestamps: true
})


const CustomerAuthModel = mongoose.model("customers", schema);

module.exports = CustomerAuthModel;