// const mongoose = require("mongoose");

// const RazorpayPaymentSchema = new mongoose.Schema(
//   {
//     order_id: { type: String },
//     order_status: {
//       type: String,
//       enum: [
//         "created",
//         "completed",
//         "failed",
//         "cancelled",
//         "refunded",
//         "pending",
//       ],
//     },
//     failure_message: { type: String },
//     payment_mode: { type: String },
//     card_name: { type: String },
//     status_code: { type: String },
//     status_message: { type: String },
//     currency: { type: String },
//     amount: { type: Number },
//     billing_name: { type: String },
//     billing_address: { type: String },
//     billing_city: { type: String },
//     billing_state: { type: String },
//     billing_zip: { type: String },
//     billing_country: { type: String },
//     billing_tel: { type: String },
//     billing_email: { type: String },
//     offer_type: { type: String },
//     offer_code: { type: String },
//     discount_value: { type: Number },
//     mer_amount: { type: Number },
//     eci_value: { type: String },
//     retry: { type: String },
//     response_code: { type: String },
//     billing_notes: { type: String },
//     trans_date: { type: Date },
//     bin_country: { type: String },
//   },
//   {
//     timestamps: true,
//   }
// );

// const RazorpayPayment = mongoose.model(
//   "RazorpayPayments",
//   RazorpayPaymentSchema
// );

// module.exports = RazorpayPayment;
