const { model, Schema } = require("mongoose");

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ifsc: {
    type: String,
    required: true,
  },
  account_no: {
    type: String,
    type: String,
    required: true,
  },
  branch_name: {
    type: String,
    required: true,
  },
  account_holder_name: {
    type: String,
    required: true,
  },
  account_type: {
    type: String,
    required: true,
  },
  contact_person: {
    type: String,
  },
  contact_email: {
    type: String,
  },
  contact_phone: {
    type: String,
  },
  swift_code: {
    type: String,
  },
});

// Create and export the model
const BankDetailsModel = model("partners_bank_details", schema);
module.exports = BankDetailsModel;
