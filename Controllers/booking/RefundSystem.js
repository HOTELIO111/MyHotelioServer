const RefundModel = require("../../Model/booking/RefundModel");

class RefundSystem {
  constructor(bookindata) {
    this.bookingData = bookingData;
  }

  async GenerateTheRefundQueryInTable({
    totalBookingAmount,
    refundableAmount,
    bookingid,
    dateOfCancellation,
    policyDeductPercentage,
    cancelledBy,
    refundResultInfo = undefined,
    notes = undefined,
    status = "pending",
  }) {
    try {
      const response = await new RefundModel({
        totalBookingAmount,
        refundableAmount,
        bookingid,
        dateOfCancellation,
        policyDeductPercentage,
        cancelledBy,
        refundResultInfo,
        notes,
        status,
      }).save();
      if (!response)
        return {
          error: true,
          message: "missing required credentials in data ",
        };
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  async GetAllApprovalRefundData() {
    try {
      const response = await RefundModel.aggregate([
        { $match: { refundApproval: false, status: "pending" } },
        { $sort: { createdAt: -1, refundApproval: 1 } },
      ]);
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  async GetUpdateApproval({ id, status }) {
    if (!id && !status) {
      return { error: true, message: "missing id or status " };
    }
    try {
      const response = await RefundModel.findByIdAndUpdate(
        { _id: id },
        { refundApproval: status },
        { new: true }
      );
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  async UpdatedTheRefundStatus({ id, formdata }) {
    if (!id && !formdata) {
      return { error: true, message: "missing id or status" };
    }
    try {
      const response = await RefundModel.findByIdAndUpdate(
        { _id: id },
        formdata,
        { new: true }
      );
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

module.exports = RefundSystem;
