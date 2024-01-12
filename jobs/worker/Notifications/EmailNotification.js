const { bookingCancelConfirmations } = require("../../../data/emailFormats");
const SendMail = require("../../../Controllers/Others/Mailer");

require("dotenv").config();

const EmailWorker = async (data) => {
  const maildata = data?.data;
  const mailOptions = {
    from: process.env.SENDEREMAIL,
    to: maildata.to,
    subject: maildata?.subject,
    html: bookingCancelConfirmations("confirm", { data: "no data" }),
  };

  // send Mail
  await SendMail(mailOptions);
};

module.exports = { EmailWorker };

const SendNow = async ({ to, subject, html, text, cc }) => {
  const mailOptions = {
    from: process.env.SENDEREMAIL,
    to: to,
    subject: subject,
  };
  if (html) {
    mailOptions.html = html;
  }
 
  if (text) {
    mailOptions.text = text;
  }

  if (cc) {
    mailOptions.cc = cc;
  }
  // Send Mail
  await SendMail(mailOptions);
};
