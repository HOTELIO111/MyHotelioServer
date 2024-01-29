const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    ifsc: {
      type: String,
      required: true,
    },
    account_no: {
      type: String,
      required: true,
    },
    account_holder_name: {
      type: String,
      required: true,
    },
    linkedMobileNo: {
      type: String,
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
