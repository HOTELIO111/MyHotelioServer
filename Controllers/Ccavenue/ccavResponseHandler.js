const http = require("http");
const fs = require("fs");
const ccav = require("./ccavutils");
const qs = require("querystring");
const { Gateway } = require("../../config/config");
const { fireOnSuccessApi } = require("./ResponseHandlersFunc");
const {
  GetTheSingleBookingPopulated,
} = require("../../helper/booking/bookingHelper");
const HandleResponse = require("./ResponseHandlersFunc");
const BookingSystem = require("../booking/BookingSystem");
require("dotenv").config();

const ClientUrl =
  process.env.ENV === "development"
    ? process.env.CLIENT_URL_DEVELOPMENT
    : process.env.CLIENT_URL_PRODUCTION;

exports.postRes = function (request, response) {
  const workingKey = Gateway().workingKey; // Put in the 32-Bit key shared by CCAvenues.
  let ccavEncResponse = "";
  let ccavResponse = "";
  let ccavPOST = "";
  let responseTemp = "";

  // Create a promise to wait for the asynchronous operations
  const processRequest = new Promise((resolve) => {
    request.on("data", async function (data) {
      ccavEncResponse += data;
      ccavPOST = qs.parse(ccavEncResponse);
      const encryption = ccavPOST.encResp;
      ccavResponse = ccav.decrypt(encryption, workingKey);
      const responseData = qs.parse(ccavResponse);
      const bookingData = await GetTheSingleBookingPopulated(
        responseData.order_id
      );
      const handler = new HandleResponse(
        responseData.merchant_param1,
        bookingData,
        responseData.order_status
      );
      const successTemplate = await handler.RenderSuccessPage(
        responseData.tracking_id,
        responseData.trans_date,
        responseData.amount,
        responseData.order_status,
        responseData.order_id
      );

      const otherTemplate = await handler.RenderOtherPage(
        responseData.tracking_id,
        responseData.trans_date,
        responseData.amount,
        responseData.order_status,
        responseData.order_id
      );

      if (responseData.order_status === "Success") {
        const handlebooking = new BookingSystem();
        await handlebooking.FinalizeBooking(responseData);
        responseTemp = successTemplate;
      } else {
        responseTemp = otherTemplate;
      }

      resolve();
    });
  });

  processRequest.then(() => {
    let pData = responseTemp;
    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write(pData);
    response.end();
  });
};
