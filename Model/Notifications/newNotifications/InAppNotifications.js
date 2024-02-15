const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    notification_mood: {
      type: String,
      enum: ["warning", "info", "danger"],
      default: "info",
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

const InAppNotifyModel = model("in_app_notifications", schema);

module.exports = InAppNotifyModel;
