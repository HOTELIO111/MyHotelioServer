const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    mobile: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const SMSTemplates = model("sms_templates", schema);

module.exports = SMSTemplates;
