const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: "text",
    },
  },
  {
    timestamps: true,
  }
);

const NotifyEventsList = model("notification_event_list", schema);

module.exports = NotifyEventsList;
