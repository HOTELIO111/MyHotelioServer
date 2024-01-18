const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    templateKeys: {
      type: Object,
      required: true,
    },
    subject: {
      type: String,
    },
    templates: {
      email: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "email_templates",
        },
      ],
      sms: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "sms_templates",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const NotificationsEventsModel = model("notifications_events", schema);

module.exports = NotificationsEventsModel;
