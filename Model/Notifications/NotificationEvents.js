const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    eventid: {
      type: String,
      required: true,
    },
    templateKeys: {
      type: Array,
      required: true,
    },
    subject: {
      type: String,
    },
    templates: {
      email: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "email_templates",
        default: null,
      },

      sms: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sms_templates",
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const NotificationsEventsModel = model("notifications_events", schema);

module.exports = NotificationsEventsModel;
