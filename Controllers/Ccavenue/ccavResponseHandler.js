var http = require("http"),
  fs = require("fs"),
  ccav = require("./ccavutils"),
  qs = require("querystring");
const { Gateway } = require("../../config/config");
const { fireOnSuccessApi } = require("./ResponseHandlersFunc");
const {
  GetTheSingleBookingPopulated,
} = require("../../helper/booking/bookingHelper");
const HandleResponse = require("./ResponseHandlersFunc");
require("dotenv").config();

const ClientUrl =
  process.env.ENV === "development"
    ? process.env.CLIENT_URL_DEVELOPMENT
    : process.env.CLIENT_URL_PRODUCTION;

exports.postRes = async function (request, response) {
  var ccavEncResponse = "",
    ccavResponse = "",
    workingKey = Gateway().workingKey, //Put in the 32-Bit key shared by CCAvenues.
    ccavPOST = "";

  // some working info
  const responseData = qs.parse(ccavResponse);
  const bookingData = await GetTheSingleBookingPopulated(responseData.order_id);
  const handler = new HandleResponse(
    responseData.merchant_param1,
    bookingData,
    responseData.order_status
  );

  request.on("data", async function (data) {
    ccavEncResponse += data;
    ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    ccavResponse = ccav.decrypt(encryption, workingKey);
    const responseData = qs.parse(ccavResponse);
    await handler.SendForFinalBooking(responseData);
  });

  request.on("end", async function () {
    const successTemplate = await handler.RenderSuccessPage(
      responseData.tracking_id,
      responseData.trans_date,
      responseData.amount,
      responseData.order_status,
      responseData.order_id
    );

    const OtherTemplate = await handler.RenderOtherPage(
      responseData.tracking_id,
      responseData.trans_date,
      responseData.amount,
      responseData.order_status,
      responseData.order_id
    );

    let pData;
    if (responseData.order_status === "Success") {
      pData = successTemplate;
    } else {
      pData = OtherTemplate;
    }

    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write(pData);
    response.end();
  });
};

// var pData = "";
// pData = "<table border=1 cellspacing=2 cellpadding=2><tr><td>";
// pData = pData + ccavResponse.replace(/=/gi, "</td><td>");
// pData = pData.replace(/&/gi, "</td></tr><tr><td>");
// pData = pData + "</td></tr></table>";
// htmlcode =
//   '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>' +
//   pData +
//   "</center><br></body></html>";
