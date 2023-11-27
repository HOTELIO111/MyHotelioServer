const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    code: {
      type: String,
      index: true,
    },
    discription: {
      type: String,
    },
    validUpTo: {
      type: Date,
    },
    
  },
  {
    timestamps: true,
  }
);
