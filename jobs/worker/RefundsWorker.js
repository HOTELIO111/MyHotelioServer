const RefundSystem = require("../../Controllers/booking/RefundSystem");

const RefundWorker = async (data) => {
  const refund = new RefundSystem(data.data);

  // Register Refund Data in Refund Table
  const refundRegistered = await refund.GenerateTheRefundQueryInTable({
    totalBookingAmount: refund.bookingData.amount,
  });
};

module.exports = RefundWorker;
