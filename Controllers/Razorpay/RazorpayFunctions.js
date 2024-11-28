const {
  createOrder,
  verifyPayment,
  capturePayment,
} = require("../../helper/Payments/payementFuctions");
const {
  CollectPaymentInfoAndConfirmBooking,
} = require("../booking/bookingController");
const Booking = require("../../Model/booking/bookingModel");
const cron = require("node-cron");

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
      // Capture payment after 3 minutes
      cron.schedule("*/3 * * * *", async () => {
        let booking = await Booking.findOne({ bookingId: req.body.order_id });
        try {
          let res = await capturePayment(
            razorpay_payment_id,
            booking.totalAmount
          );
          console.log(
            "Razorpay :: Payment captured :: ",
            razorpay_payment_id,
            " :: Amount :: ",
            booking.totalAmount
          );
        } catch (error) {
          console.log(
            "Razorpay :: Payment capture failed :: ",
            razorpay_payment_id,
            " :: Amount :: ",
            booking.totalAmount
          );
          console.log("Error :: ", error);
        }
      });
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

const verifyPaymentStatus = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: true,
        message: "Invalid request",
      });
    }
    const response = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (response) {
      res
        .status(200)
        .json({ error: false, message: "Payment successful", data: response });
    } else {
      res
        .status(400)
        .json({ error: true, message: "Invalid payment", data: response });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { initPayment, validatePayment, verifyPaymentStatus };
