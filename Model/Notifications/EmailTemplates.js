const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: function () {
        return !this.message;
      },
    },
    message: {
      type: String,
      required: function () {
        return !this.html;
      },
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

const EmailTemplates = model("email_templates", schema);

module.exports = EmailTemplates;
