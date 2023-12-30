const SendMail = require("../Others/Mailer");

require("dotenv").config();

const EmailWorker = async (data) => {
  const maildata = data?.data;
  const mailOptions = {
    from: process.env.SENDEREMAIL,
    to: maildata.to,
    subject: maildata?.subject,
    html: ` <div style="background: #f8f8f8; padding: 20px; text-align: center">
    <img
      src="https://img.freepik.com/free-vector/organic-flat-hotel-banner-with-photo_52683-62489.jpg"
      alt="Hotelio Logo"
      style="
        max-width: 100%;
        height: 100px;
        width: 100%;
        object-fit: cover;
        object-position: center;
      "
    />
    <h1 style="color: #333; margin: 10px 0">Hotel Booking Confirmed!</h1>
    <p style="color: #666; margin: 10px 0">
      Thank you for choosing Hotelio as your travel partner. Your booking has
      been confirmed.
    </p>
    <a
      href="https://www.hoteliorooms.com"
      target="_blank"
      style="
        display: inline-block;
        padding: 10px 20px;
        background: #3498db;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
      "
      >Visit Hotelio</a
    >
  </div>`,
  };

  // send Mail
  await SendMail(mailOptions);
};

module.exports = { EmailWorker };
