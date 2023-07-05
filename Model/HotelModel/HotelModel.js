const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true,
    },
    hotelEmail: {
        type: String,
        required: true,
    },
    hotelAddress: {
        type: String,
        required: true,
    },
    hotelMapLink: {
        type: String,
        required: true,
    },
    hotelGST: {
        type: String,
        required: true,
    },
    hotelMobileNo: {
        type: Number,
        required: true,
    },
    hotelRooms: {
        single: {
            type: Number,
            required: true,
        },
        twin: {
            type: Number,
            required: true,
        },
        family: {
            type: Number,
            required: true,
        },
    },
    roomsImages: [String],
    checkInTime: {
        type: Date,
        required: true,
    },
    checkOutTime: {
        type: Date,
        required: true,
    },
    hotelStatus: {
        type: Boolean,
        required: true,
    },
    // hotelTiming: {
    //     type: Map,
    //     of: {
    //         open: String,
    //         close: String,
    //     },
    //     required: true,
    // },
    hotelBookings: [
        {
            guestName: {
                type: String,
                required: true,
            },
            roomType: {
                type: String,
                required: true,
            },
            checkInDate: {
                type: Date,
                required: true,
            },
            checkOutDate: {
                type: Date,
                required: true,
            },
        },
    ],
    hotelAmenities: [String],
    hotelRatings: {
        type: String,
        required: true,
    },
    geoLocation: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },


}, {
    timestamps: true
})


const HotelModel = mongoose.model("Hotels", schema)

module.exports = HotelModel;