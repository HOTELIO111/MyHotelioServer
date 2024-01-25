const handleBars = require("handlebars");

const bookingCancelConfirmations = (type, formdata) => {
  let result;
  const htmlData = `<div
style="
  max-width: 100%;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
"
>
<img
  src="https://www.hoteliorooms.com/favicon.ico"
  alt="Your Company Logo"
  style="display: block; margin: 0 auto"
  width="150"
/>
<h1 style="color: red">Booking Cancellation Confirmation</h1>
<p>Dear {{customerName}},</p>
<p>
  We regret to inform you that your recent booking with us has been
  canceled successfully. We understand that plans can change, and we
  appreciate your understanding in this matter.
</p>
<div
  style="border-top: 2px solid #ddd; padding-top: 10px; margin-top: 20px"
>
  <p>
    <strong>Booking ID:{{bookingid}}<br />
    Booking Hotel Name : {{hotelName}}<br />
    Booking Date: {{bookingFrom}}-{{bookingTo}}<br />
    Rooms:{{rooms}}<br/>
    Cancellation Date: {{cancelationDate}}
  </p>
  <p>
    <strong>Refund Details:</strong><br />
    Total Booking Amount: {{totalBookingAmount}}<br />
    Refund Amount: {{refundsAmount}}<br />
  </p>
  <p>
    We are processing the refund of {{refundsAmount}} to your original
    payment source. Please allow 7 to 14 business days for the refund to
    reflect in your account. The exact timing may vary depending on your
    financial institution.
  </p>
</div>
<p>
  If you have any questions or concerns regarding this cancellation and
  refund process, feel free to contact our customer support at [Customer
  Support Email/Phone Number].
</p>
<p>
  We sincerely apologize for any inconvenience this may have caused and
  appreciate your understanding. We hope to have the opportunity to serve
  you in the future.
</p>
<p>Thank you for choosing Hotelio -Your Travel Partner.</p>
</div>`;
  const BookinConfirmedEmail = `<div style="background: #f8f8f8; padding: 20px; text-align: center">
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
</div>`;

  if (type === "confirm") {
    result = BookinConfirmedEmail;
  } else if (type === "cancel") {
    const template = handleBars.compile(htmlData);
    const data = {
      customerName: formdata.customerName,
      bookingid: formdata.bookingid,
      hotelName: formdata.hotelName,
      bookingFrom: formdata.bookingFrom,
      bookingTo: formdata.bookingTo,
      rooms: formdata.rooms,
      cancelationDate: formdata.cancelationDate,
      totalBookingAmount: formdata.totalBookingAmount,
      refundsAmount: formdata.refundsAmount,
    };
    result = template(data);
  }

  return result;
};

module.exports = { bookingCancelConfirmations };
