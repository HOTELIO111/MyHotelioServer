const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    ifsc: {
      type: String,
      required: true,
    },
    accountNo: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    linkedMobileNo: {
      type: Number,
    },
    bankName: {
      type: String,
    },
    transactions: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const BankDetailsModel = model("partners_bank_details", schema);
module.exports = BankDetailsModel;
