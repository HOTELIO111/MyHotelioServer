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
    status: {
        type: Boolean,
    },
    password: String,
    hotels: [],
    secretKey: String,
    resetLink: String,
    resetDateExpire: Date,
}, {
    timestamps: true
})



const VendorModel = mongoose.model("hotel-partners", schema);

module.exports = VendorModel;
