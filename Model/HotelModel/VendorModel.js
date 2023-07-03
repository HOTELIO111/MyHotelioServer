const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    partnerName: {
        type: String,
    },
    partnerEmail: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: String,
        required: true,
    },
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
    hotels: []
}, {
    timestamps: true
})



const VendorModel = mongoose.model("hotel-partners", schema);

module.exports = VendorModel;
