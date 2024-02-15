const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification_event_list",
      unique: true,
      required: true,
    },
    templateKeys: {
      type: Array,
    },
    notificationTo: {
      customer: {
        email: {
          type: Boolean,
          required: true,
          default: false,
        },
        mobile: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      partner: {
        email: {
          type: Boolean,
          required: true,
          default: false,
        },
        mobile: {
          type: Boolean,
          required: true,
          default: false,
        },
        inApp: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      admin: {
        email: {
          type: Boolean,
          required: true,
          default: false,
        },
        mobile: {
          type: Boolean,
          required: true,
          default: false,
        },
        inApp: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      agent: {
        email: {
          type: Boolean,
          required: true,
          default: false,
        },
        mobile: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const NotificationEvent = model("notification_events", schema);

module.exports = NotificationEvent;
