const { bookingCancelConfirmations } = require("../../../data/emailFormats");
const SendMail = require("../../../Controllers/Others/Mailer");

require("dotenv").config();

const EmailWorker = async (data) => {
  // mail sended
  console.log("mail sended");
};

module.exports = { EmailWorker };
