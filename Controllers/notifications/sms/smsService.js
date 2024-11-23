const whistleProvider = require("./providers/whistleProvider");
const { getSMSTemplate } = require("./template");
const BookingModel = require("../../../Model/booking/bookingModel");

class SMSService {
  constructor() {
    this.provider = whistleProvider;
  }

  async sendBookingConfirmationSMS(details) {
    // check if details has all the required fields
    if (!details.customerName) {
      throw new Error("customerName is required");
    } else if (!details.hotelName) {
      throw new Error("hotelName is required");
    } else if (!details.checkIn) {
      throw new Error("checkIn is required");
    } else if (!details.checkOut) {
      throw new Error("checkOut is required");
    } else if (!details.roomType) {
      throw new Error("roomType is required");
    } else if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("bookingConfirmation", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendPaymentConfirmationSMS(details) {
    // check if details has all the required fields
    if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.amount) {
      throw new Error("amount is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("paymentConfirmation", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendCheckInReminderSMS(details) {
    // check if details has all the required fields
    const booking = await BookingModel.findOne({
      bookingId: details.bookingId,
    });
    if (booking.bookingStatus !== "confirmed") {
      console.log(
        "Booking not found failed to send checkIn reminder",
        details.bookingId
      );
      return;
    }
    if (!details.hotelName) {
      throw new Error("hotelName is required");
    } else if (!details.checkIn) {
      throw new Error("checkIn is required");
    } else if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("checkInReminder", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendCheckOutReminderSMS(details) {
    // check if details has all the required fields
    const booking = await BookingModel.findOne({
      bookingId: details.bookingId,
    });
    if (booking.bookingStatus !== "confirmed") {
      console.log(
        "Booking not found failed to send checkOut reminder",
        details.bookingId
      );
      return;
    }
    if (!details.hotelName) {
      throw new Error("hotelName is required");
    } else if (!details.checkOut) {
      throw new Error("checkOut is required");
    } else if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("checkOutReminder", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendCancellationConfirmationSMS(details) {
    // check if details has all the required fields
    if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("cancellationConfirmation", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendOtpSMS(details) {
    // check if details has all the required fields
    if (!details.otp) {
      throw new Error("otp is required");
    } else if (!details.mobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("otp", details);
    return this.provider.sendSms(details.mobileNumber, message);
  }

  async sendCustomerRegistrationSMS(details) {
    // check if details has all the required fields
    if (!details.customerName) {
      throw new Error("customerName is required");
    } else if (!details.customerMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("customerRegistration", details);
    return this.provider.sendSms(details.customerMobileNumber, message);
  }

  async sendVendorRegistrationSMS(details) {
    // check if details has all the required fields
    if (!details.vendorMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("vendorRegistration", details);
    return this.provider.sendSms(details.vendorMobileNumber, message);
  }

  async sendVendorNewBookingSMS(details) {
    // check if details has all the required fields
    if (!details.hotelName) {
      throw new Error("hotelName is required");
    } else if (!details.customerName) {
      throw new Error("customerName is required");
    } else if (!details.checkIn) {
      throw new Error("checkIn is required");
    } else if (!details.checkOut) {
      throw new Error("checkOut is required");
    } else if (!details.roomType) {
      throw new Error("roomType is required");
    } else if (!details.amount) {
      throw new Error("amount is required");
    } else if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.vendorMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("venderNewBooking", details);
    return this.provider.sendSms(details.vendorMobileNumber, message);
  }

  async sendVendorBookingCancelSMS(details) {
    // check if details has all the required fields
    if (!details.hotelName) {
      throw new Error("hotelName is required");
    } else if (!details.customerName) {
      throw new Error("customerName is required");
    } else if (!details.checkIn) {
      throw new Error("checkIn is required");
    } else if (!details.bookingId) {
      throw new Error("bookingId is required");
    } else if (!details.vendorMobileNumber) {
      throw new Error("mobileNumber is required");
    }
    const message = getSMSTemplate("venderBookingCancel", details);
    return this.provider.sendSms(details.vendorMobileNumber, message);
  }
}

module.exports = new SMSService();
