const { default: axios } = require("axios");
const handleBars = require("handlebars");
const {
  TransactionDetails,
  BookingDetails,
  WebTemplate,
  dynamicPageTitle,
} = require("./templates");
const Booking = require("../../Model/booking/bookingModel");
const {
  GetTheSingleBookingPopulated,
} = require("../../helper/booking/bookingHelper");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

class HandleResponse {
  constructor(paymentType, bookingDetials, status) {
    this.paymentType = paymentType;
    this.serverUrl = process.env.SERVER_URL_PRODUCTION;
    this.transactionTemplate = TransactionDetails;
    this.bookingDetailsTemplate = BookingDetails;
    this.bookingdata = bookingDetials;
    this.paymentStatus = dynamicPageTitle(status);
  }

  async SendForFinalBooking(paymentDetails) {
    if (!this.paymentType) {
      throw new Error("Please provide the payment type in HandleResponse");
    }
    if (!paymentDetails) {
      throw new Error("please provide the details");
    }
    try {
      const response = await axios.post(
        this.serverUrl + `/hotel/book/booking/final/${this.paymentType}`,
        paymentDetails
      );
      if (response.status === 200) {
        return { error: false, message: "success", data: response };
      }
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async RenderSuccessPage(
    transaction_id,
    date,
    amount,
    payment_status,
    orderid
  ) {
    try {
      const RoomData = this.bookingdata?.data[0]?.hotel?.rooms?.find(
        (item) => item._id === this.bookingdata?.data[0]?.room
      );

      const template = handleBars.compile(this.transactionTemplate);
      const bookingTemplate = handleBars.compile(this.bookingDetailsTemplate);
      const data = {
        txnId: transaction_id,
        date: date,
        amt: amount,
        payment_status: payment_status,
        bookingId: orderid,
      };

      const bookingData = {
        bookingId: orderid,
        hotelName: this.bookingdata?.data[0]?.hotel?.hotelName,
        guests: this.bookingdata?.data[0].numberOfGuests?.adults,
        bookingDate: `from : ${this.bookingdata?.data[0].bookingDate?.checkIn} - to : ${this.bookingdata?.data[0].bookingDate?.checkOut} `,
        roomType: RoomData?.roomType?.title,
        paidAmount: amount,
      };
      const htmlTemp = template(data);
      const bookingDetalsHtmlTemp = bookingTemplate(bookingData);
      const GeneratedHtml = WebTemplate({
        transaction: htmlTemp,
        booking: bookingDetalsHtmlTemp,
        timer: 6,
        title: this.paymentStatus,
      });
      return GeneratedHtml;
    } catch (error) {
      console.log({
        error: true,
        message: error.message,
      });
    }
  }
  async RenderOtherPage(transaction_id, date, amount, payment_status, orderid) {
    try {
      const template = handleBars.compile(this.transactionTemplate);
      const data = {
        txnId: transaction_id,
        date: date,
        amt: amount,
        payment_status: payment_status,
        bookingId: orderid,
      };

      const htmlTemp = template(data);
      const GeneratedHtml = WebTemplate({
        transaction: htmlTemp,
        timer: 3,
        title: this.paymentStatus,
      });
      return GeneratedHtml;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = HandleResponse;
