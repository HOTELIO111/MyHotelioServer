const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    eventid: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SMSTemplates = model("sms_templates", schema);

module.exports = SMSTemplates;
