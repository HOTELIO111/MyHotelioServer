const { formatMobileNumber } = require("../../../utils");

const sendSms = async (phoneNumber, message) => {
  // Send sms using Whistle API
  const url = process.env.W_URL;
  const user = process.env.W_USER;
  const senderId = process.env.W_SENDERID;
  const password = process.env.W_PASSWORD;

  const mobileNumber = formatMobileNumber(new String(phoneNumber));
  if (!mobileNumber) {
    console.log("Invalid Mobile Number");
    return false;
  }
  let response = await fetch(
    `${url}user=${user}&password=${password}&senderid=${senderId}&mobiles=${mobileNumber}&sms=${message}`
  );
  if (response.status !== 200) {
    console.log("Error in sending SMS" + response);
    return false;
  }
  return response;
};

module.exports = { sendSms };
