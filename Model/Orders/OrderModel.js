const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    hotelId: {
        type: String,
    },
    hotelName: {
        type: String,
    },
    amount: {
        type: String,
    },
    checkInTime: Date,
    checkOutTime: Date,
    bookedRoom: {
        type: String,
    },
    bookedAminities: [],
    discountCoupons: [],
    bookedTime: {
        type: String,
    },
    guestInfo: {},
    dateOfBooking: String,
}, {
    timestamps: true
})


const OrderModel = mongoose.model("Orders", schema);

module.exports = OrderModel;