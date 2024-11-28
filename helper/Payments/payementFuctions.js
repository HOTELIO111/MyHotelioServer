const Razorpay = require("razorpay");
const PaymentResponse = require("../../Model/booking/PaymentsModel");
const Booking = require("../../Model/booking/bookingModel");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const CreateThePaymentInfo = async (formdata) => {
  try {
    const _paymentReg = await new PaymentResponse(formdata).save();

    await Booking.findOneAndUpdate(
      {
        bookingId: formdata.order_id,
      },
      {
        $push: {
          "payment.payments": _paymentReg._id,
        },
      },
      {
        new: true,
      }
    );

    return _paymentReg;
  } catch (error) {
    return error;
  }
};

// Razorpay initialization and helper function

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount, receipt = "receipt#1") => {
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: receipt,
      payment_capture: 0,
    };
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    return error;
  }
};

const capturePayment = async (payment_id, amount) => {
  try {
    const payment = await instance.payments.capture(payment_id, amount * 100, "INR");
    return payment;
  } catch (error) {
    return error;
  }
};

const verifyPayment = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) => {
  const secret = instance.key_secret;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(
      body,
      razorpay_signature,
      secret
    );

    if (isValidSignature) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { CreateThePaymentInfo, createOrder, verifyPayment, capturePayment };
