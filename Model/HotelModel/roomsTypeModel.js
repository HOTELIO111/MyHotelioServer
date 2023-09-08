const { Schema, model } = require('mongoose');

const schema = new Schema({
    roomType: {
        type: String,
    },
    personAllowed: {
        type: Number,
        default: 4,
    },
    includeFacilities: {
        type: Array,
    },
    minPrice: {
        type: Number,
        required: true
    },
    maxPrice: {
        type: Number,
        required: true
    },
    amenties: Array
}, {
    timestamps: true
})



const RoomsTypeModel = model("room-category", schema)

module.exports = RoomsTypeModel;