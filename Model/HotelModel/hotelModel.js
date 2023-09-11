const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    vendorId: {
        type: String,
        required: function () {
            return this.isAddedBy === "vendor"
        }
    },
    isAddedBy: {
        type: String,
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
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    zipCode: {
        type: Number,
    },
    discription: {
        type: String,
    },
    geoLoc: {
        lang: String,
        lat: String,
    },
    // Hotel rooms info 
    rooms: [
        {
            counts: {
                type: Number,
                default: 1
            },
            roomType: String,
            price: String,
            prevPrice: String,
            status: {
                type: Boolean,
                default: true
            }
        }
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
    cancellationPolicy: String,
    termsAndCondition: {
        type: Boolean,
        default: false
    },
    hotelFullySanitized: {
        type: Boolean,
        default: false
    },
    notSupportDiscrimination: {
        type: Boolean,
        default: false
    },
    validAndTrueData: {
        type: Boolean,
        default: false
    },


    // Hotel Bookings 
    hotelBookings: {
        type: Array
    },
    // Sir hi jane 
    hotelMapLink: {
        type: String,
        required: true,
        default: "No Link"
    },
    isAdminApproved: Boolean,
    isPostpaidAllowed: {
        type: Boolean,
        default: false
    },
    hotelRatings: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
        default: 0
    },
}, {
    timestamps: true
})


const HotelModel = mongoose.model("Hotels", schema)

module.exports = HotelModel;