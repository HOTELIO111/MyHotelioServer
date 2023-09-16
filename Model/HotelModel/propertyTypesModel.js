const { Schema, model } = require('mongoose')


const schema = new Schema({
    name: {
        type: String,
    },
}, {
    timestamps: true,
})


const PropertyTypes = model("property-types", schema)

module.exports = PropertyTypes;