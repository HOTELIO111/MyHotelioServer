const {
  PreBookingFunction,
  CreateBooking,
} = require("../../helper/booking/bookingHelper");
const {
  GetTheRoomAvailiabilityStats,
} = require("../../helper/hotel/roomManagementHelper");

const CreatePreBooking = async (data) => {
  if (data.data?.payment?.status === "success") {
    const create = await CreateBooking(data.data, data.name, "confirmed");
    if (create) {
      console.log("Booking Confirmed");
    }
  } else {
    const create = await CreateBooking(data.data, data.name, "failed");
    if (create) {
      console.log("Booking Confirmed");
    }
  }
};

// Calculate the TotalRooms

module.exports = { CreatePreBooking };
