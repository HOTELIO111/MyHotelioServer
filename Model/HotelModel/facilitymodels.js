const { Schema, model } = require('mongoose');

const schema = new Schema({
    title: {
        type: String,
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isMandatory: {
        type: Boolean,
        default: false,
    },
    price: {
        type: String,
    }
}, {
    timestamps: true,
});

const FacilitiesModel = model("facilities", schema);

module.exports = FacilitiesModel;
