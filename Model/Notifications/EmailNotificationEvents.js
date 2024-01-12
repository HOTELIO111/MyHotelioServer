const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    customer: {
      email: {
        type: Boolean,
      },
      mobile: {
        type: Boolean,
      },
      in_app: {
        type: Boolean,
      },
      template: {
        type: String,
      },
    },
    agent: {
      email: {
        type: Boolean,
      },
      mobile: {
        type: Boolean,
      },
      in_app: {
        type: Boolean,
      },
      template: {
        type: String,
      },
    },
    hotelio_partner: {
      email: {
        type: Boolean,
      },
      mobile: {
        type: Boolean,
      },
      in_app: {
        type: Boolean,
      },
      template: {
        type: String,
      },
    },
    owner: {
      email: {
        type: Boolean,
      },
      mobile: {
        type: Boolean,
      },
      in_app: {
        type: Boolean,
      },
      template: {
        type: String,
      },
    },
    requiredKeys: {
      type: Object,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    notifyTo: {
      type: [String],
      enum: ["customer", "hotel_partner", "owner"],
    },
  },
  {
    timestamps: true,
  }
);

const EmailEventModel = model("email_events", schema);

module.exports = EmailEventModel;
