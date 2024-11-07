const getSMSTemplate = (type, details) => {
  try {
    switch (type) {
      case "bookingConfirmation":
        return `Dear ${details.customerName}, your booking is confirmed! Hotel: ${details.hotelName}, Dates: ${details.checkIn} - ${details.checkOut}, Room Type: ${details.roomType}. Booking ID: ${details.bookingId}. Thank you for choosing Hotelio!`;
      case "paymentConfirmation":
        return `Payment successful! Your booking ID is ${details.bookingId}. Amount paid: ${details.amount}. Thank you for your payment. Hotelio Team.`;
      case "checkInReminder":
        return `Check-in tomorrow! Hotel: ${details.hotelName}, Time: ${details.checkIn}. Booking ID: ${details.bookingId}. We're ready to welcome you! Hotelio Team.`;
      case "checkOutReminder":
        return `Check-out today! Hotel: ${details.hotelName}, Time: ${details.checkOut}. Booking ID: ${details.bookingId}. Thank you for staying with us! Hotelio Team.`;
      case "cancellationConfirmation":
        return `Booking cancelled! Booking ID: ${details.bookingId}. Refund (if applicable) will be processed within 2 working days. Thank you for notifying us. Hotelio Team.`;
      case "otp":
        return `${details.otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone (otp) Houda Carjour Tourism`;
      default:
        return null;
    }
  } catch (error) {
    return new Error("Error in getting SMS template" + error);
  }
};

module.exports = { getSMSTemplate };
