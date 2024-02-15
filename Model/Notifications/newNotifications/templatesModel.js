const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: function () {
        return this.type === "email";
      },
    },
    message: {
      type: String,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification_event_list",
      required: true,
    },
    subject: {
      type: String,
      default: "",
      required: function () {
        return this.type === "email" || this.type === "inApp";
      },
    },
    type: {
      type: String,
      enum: ["email", "mobile", "inApp"],
      required: true,
    },
    for: {
      type: String,
      enum: ["partner", "admin", "agent", "customer"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TemplatesModel = mongoose.model("templates", schema);

module.exports = TemplatesModel;
