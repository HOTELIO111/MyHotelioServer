const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    eventId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    notified: {
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
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = model("notifications_models", schema);

module.exports = NotificationModel;
