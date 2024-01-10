const RefundModel = require("../../Model/booking/RefundModel");
const Booking = require("../../Model/booking/bookingModel");

const RegisterRefundBookingCalceled = async (refundData, bookingId) => {
  try {
    const createRefundRequest = await new RefundModel(refundData).save();

    // update the refund id in booking
    await Booking.findOneAndUpdate(
      { bookingId: bookingId },
      { $push: { refunds: createRefundRequest?._id } },
      { new: true }
    );

    return createRefundRequest;
  } catch (error) {
    return error;
  }
};

module.exports = { RegisterRefundBookingCalceled };
