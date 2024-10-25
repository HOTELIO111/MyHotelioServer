const {
  createOrder,
  verifyPayment,
} = require("../../helper/Payments/payementFuctions");
const { CollectPaymentInfoAndConfirmBooking } = require("../booking/bookingController");

const initPayment = async (req, res) => {
  const { amount, receipt = "" } = req.body;
  try {
    const order = await createOrder(amount, receipt);
    res.status(200).json({ error: false, message: "success", data: order });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const validatePayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const response = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (response) {
        req.body.order_status = "Success";
        req.body.tracking_id = razorpay_payment_id;
        CollectPaymentInfoAndConfirmBooking(req, res);
    } else {
      res
        .status(400)
        .json({ error: true, message: "Invalid payment", data: response });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { initPayment, validatePayment };
