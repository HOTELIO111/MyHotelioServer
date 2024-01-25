const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    html: {
      type: String,
      required: true,
    },
    message: {
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

const EmailTemplates = model("email_templates", schema);

module.exports = EmailTemplates;
