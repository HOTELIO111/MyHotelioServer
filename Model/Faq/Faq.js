const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const FaqModel = model("faqs", schema);

module.exports = FaqModel;
