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
        type: String,
    },
    hotelStatus: {
        type: Boolean,
    },
    hotelAmmenities: [],
    hotelRatings: String,
    geoLoaction: [],
    
}, {
    timestamps: true
})


const HotelModel = mongoose.model("Hotels", schema)

module.exports = HotelModel;