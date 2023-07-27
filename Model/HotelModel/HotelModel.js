const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    vendorId: {
        type: String,
        required: true
    },
    // Hotel Details 
    hotelName: {
        type: String,
    },
    hotelType: {
        type: String,
    },
    hotelEmail: {
        type: String,
    },
    hotelMobileNo: {
        type: Number,
    },
    locality: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    zipCode: {
        type: Number,
    },
    geoLoc: {
        lang: String,
        lat: String,
    },
    // Hotel rooms info 
    rooms: [
        { counts: Number, roomType: String }
    ],
    amenities: {
        type: Array
    },
    hotelCoverImg: {
        type: String,
    },
    hotelImages: {
        type: Array,
    },
    checkOut: {
        type: String,
    },

    // Legal Documents
    ownershipType: String,
    regNo: String,
    regDocumentImg: String,
    businessPan: String,
    businessPanImg: String,
    gstNo: String,
    gstImg: String,
    tinNo: String,
    tinImg: String,

    // Policy and privacy 
    cancellationPrice: String,
    termsAndCondition: Boolean,
    hotelFullySanitized: Boolean,
    notSupportDiscrimination: Boolean,
    validAndTrueData: Boolean,


    // Hotel Bookings 
    hotelBookings: {
        type: Array
    },
    // Sir hi jane 
    hotelMapLink: {
        type: String,
        required: true,
    },
    isAdminApproved: Boolean,
    hotelRatings: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 1
    },
}, {
    timestamps: true
})


const HotelModel = mongoose.model("Hotels", schema)

module.exports = HotelModel;