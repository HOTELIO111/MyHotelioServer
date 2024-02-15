const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotifyEventsList = model("notification_event_list", schema);

module.exports = NotifyEventsList;
