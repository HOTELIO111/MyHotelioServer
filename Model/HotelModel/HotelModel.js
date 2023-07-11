const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    // hotel info
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
    hotelMobileNo: {
        type: Number,
        required: true,
    },

    hotelStatus: {
        type: Boolean,
        required: true,
    },
    hotelZip: String,
    HotelCoverImg: String,
    hotelRooms: {},
    hotelRoomsImg: [],

    // Ammenities
    hotelAmenities: [],

    // Hotel legal Info 
    hotelOwnerType: String,
    hotelRegNo: String,
    hotelRegImg: String,
    hotelPanCard: String,
    hotelPanImg: String,
    hotelGST: String,
    hotelGSTImg: String,
    hotelTinNo: String,
    hotelTinImg: String,

    // hotel Timings
    checkInTime: {
        type: Date,
        required: true,
    },
    checkOutTime: {
        type: Date,
        required: true,
    },

    // cancelations charge
    hotelCancelCharge: String,
    policyAccepted: [],
    // Sir hi jane 
    hotelMapLink: {
        type: String,
        required: true,
    },
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