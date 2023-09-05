const { Schema, model } = require('mongoose');

const schema = new Schema({
    amenity: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})


const AmenityModel = model("amenities", schema)


module.exports = AmenityModel;