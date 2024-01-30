const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    html: {
      type: String,
      required: function () {
        return !message;
      },
    },
    message: {
      type: String,
      required: function () {
        return !html;
      },
    },
    eventid: {
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

schema.pre("save", async function (next) {
  if (this.isActive) {
    // Find and update other documents to set isActive to false
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  } else {
    // If isActive is set to false, ensure there's at least one document with isActive set to true
    const count = await this.constructor.countDocuments({ isActive: true });
    if (count === 0) {
      // If no document has isActive set to true, set it to true for the current document
      this.isActive = true;
    }
  }
  next();
});

const EmailTemplates = model("email_templates", schema);

module.exports = EmailTemplates;
