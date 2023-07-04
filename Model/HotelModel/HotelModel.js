const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    hotelName: {
        type: String,
    },
    hotelEmail: {
        type: String,
    },
    hotelAddress: {
        type: String,
    },
    hotelMapLink: {
        type: String,
    },
    hotelGST: {
        type: String,
    },
    hotelMobileNo: {
        type: Number,
    },
    hotelRooms: {
        type: Object,
    },
    hotelStatus: {
        type: Boolean,
    },
    hotelTiming: {},
    hotelBookings: [],
    hotelAmmenities: [],
    hotelRatings: String,
    geoLoaction: {},

}, {
    timestamps: true
})


const HotelModel = mongoose.model("Hotels", schema)

module.exports = HotelModel;