const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNo: {
      type: Number,
    },
    bookings: {
      type: Array,
    },
    commission: {
      type: Number,
    },
    wallet: {
      type: Number,
    },
    gstNo: {
      type: String,
    },
    panNo: {
      type: String,
    },
    password: {
      type: String,
    },
    resetLink: String,
    resetDateExpires: Date,
    secretKey: String,
  },
  {
    timestamps: true,
  }
);

const AgentModel = model("agents", schema);

module.exports = AgentModel;
