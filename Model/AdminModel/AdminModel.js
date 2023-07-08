const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: Number,
        required: true
    },
    password: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
})




const AdminModel = mongoose.model("Admin", schema)

module.exports = AdminModel;