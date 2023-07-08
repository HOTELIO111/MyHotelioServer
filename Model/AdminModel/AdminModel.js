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
    role: {
        type: String,
        required: true,
    },
    password: {
        type: Number,
        required: true
    },
    resetLink: String,
    resetDateExpires: Date,
    secretKey: String,
}, {
    timestamps: true,
})




const AdminModel = mongoose.model("Admin", schema)

module.exports = AdminModel;