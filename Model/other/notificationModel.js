const { Schema, model } = require('mongoose');


const schema = new Schema({
    message: {
        type: String,
        required: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


const NotificationModel = model("notifications", schema)


module.exports = NotificationModel; 