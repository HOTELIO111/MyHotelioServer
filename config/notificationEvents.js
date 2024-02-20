const NotifyEventsList = require("../Model/Notifications/newNotifications/Events");

const events = {
  CUSTOMER_REGISTER: "CUSTOMER_REGISTER",
  PARTNER_REGISTER: "PARTNER_REGISTER",
  PARTNER_KYC_REQUESTED: "PARTNER_KYC_REQUESTED",
  PARTNER_KYC_FAILED: "PARTNER_KYC_FAILED",
  PARTNER_KYC_COMPLETED: "PARTNER_KYC_COMPLETED",
  PARTNER_DELETED: "PARTNER_DELETED",
  PARTNER_UPDATED_BANK_DETAILS: "PARTNER_UPDATED_BANK_DETAILS",
  PARTNER_KYC_UPDATED: "PARTNER_KYC_UPDATED",
  HOTEL_ADDED_NEW: "HOTEL_ADDED_NEW",
  HOTEL_DELETED: "HOTEL_DELETED",
  HOTEL_ROOM_CONFIG_UPDATED: "HOTEL_ROOM_CONFIG_UPDATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_ABORTED: "BOOKING_ABORTED",
  BOOKING_EXPIRED: "BOOKING_EXPIRED",
  REFUND_COMPLETION: "REFUND_COMPLETION",
  REFUND_FAILED: "REFUND_FAILED",
  CUSTOMER_DELETED: "CUSTOMER_DELETED",
};

const FindEventId = async (eventCode) => {
  try {
    const eventId = await NotifyEventsList.findOne({ title: eventCode });
    if (eventId) {
      return { error: false, message: "success", data: eventId._id };
    } else {
      return { error: true, message: "No data found with this event id " };
    }
  } catch (error) {
    return { error: true, message: error.message };
  }
};

module.exports = { events, FindEventId };
