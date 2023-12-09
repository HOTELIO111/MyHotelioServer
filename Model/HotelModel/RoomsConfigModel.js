const { model, Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    roomid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
    rooms: {
      type: Number,
    },
    will: {
      type: String,
      default: "dec",
      enum: ["inc", "dec"],
    },
  },
  {
    timestamps: true,
  }
);

const RoomConfigModel = model("room-configs", schema);

module.exports = RoomConfigModel;
