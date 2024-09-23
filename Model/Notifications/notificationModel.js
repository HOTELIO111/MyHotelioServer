const { default: mongoose } = require("mongoose");
const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    notification_mood: {
      type: String,
      enum: ["warning", "info", "danger"],
      default: "info",
    },
    recipient: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = model("notifications", schema);

module.exports = NotificationModel;
