const PaymentResponse = require("../../Model/booking/PaymentsModel");
const Booking = require("../../Model/booking/bookingModel");

const CreateThePaymentInfo = async (formdata) => {
  try {
    const _paymentReg = await new PaymentResponse(formdata).save();

    await Booking.findOneAndUpdate(
      {
        bookingId: formdata.order_id,
        "payment.payments": { $ne: _paymentReg?._id },
      },
      {
        $addToSet: { "payment.payments": _paymentReg?._id },
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

module.exports = { CreateThePaymentInfo };
