const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    mobileNo: {
      type: Number,
      unique: true,
    },
    bookings: {
      type: Array,
    },
    commission: {
      percentage: {
        type: Number,
        default: 0,
      },
       
    },
    wallet: {
      type: Number,
    },
    gstNo: {
      type: String,
      unique: true,
    },
    panNo: {
      type: String,
      unique: true,
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
