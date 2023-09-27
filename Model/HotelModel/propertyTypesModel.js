const { Schema, model } = require('mongoose')


const schema = new Schema({
    title: {
        type: String,
    },
}, {
    timestamps: true,
})


const PropertyTypes = model("property-types", schema)

module.exports = PropertyTypes;