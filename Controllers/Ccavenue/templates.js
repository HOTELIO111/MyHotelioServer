const WebTemplate = ({ transaction, booking, timer, title }) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Transaction and Booking Details</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
  
        .container {
          width: 80%;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
  
        h2 {
          color: #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
  
        .details {
          margin-top: 20px;
        }
  
        .details table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
  
        .details table,
        .details th,
        .details td {
          border: 1px solid #ddd;
        }
  
        .details th,
        .details td {
          padding: 15px;
          text-align: left;
        }
  
        .details th {
          background-color: #ee2e24;
          color: #fff;
        }
  
        .details td {
          background-color: #fff;
          color: #ee2e24;
        }
        #countdown-placeholder{
          color:red;
          font-weight:700;
          font-size:24px;
          border:3px solid red; 
          padding:1rem 1.5rem;
          width:fit-content;
          border-radius: 100%;
        }
      </style>
    </head>
    <body>
      <div class="container">
      <div id="countdown-placeholder"></div>
        <div style="text-align: center;">
          ${title}
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #ee2e24;
          "
        >
          <h2>Transaction and Booking Details</h2>
          <img
            style="width: 200px; height: 200x"
            src="https://www.hoteliorooms.com/static/media/HotelioLogo.8079a48b3c088ec911fa.png"
            alt="Logo"
          />
        </div>
  
      ${transaction ? transaction : ""}
      ${booking ? booking : ""}
    
      </div>
      <script>
        var countdown = ${timer};
        function updateCountdown() {
          // Update the placeholder element with the countdown value
          document.getElementById('countdown-placeholder').innerHTML = countdown;
          if (countdown === 0) {
            window.location.href = 'https://www.hoteliorooms.com/YourBooking';
          } else {
            countdown--;
            setTimeout(updateCountdown, 1000);
          }
        }
        updateCountdown();
      </script>
    </body>
  </html>
  `;
};

const dynamicPageTitle = (status) => {
  let value;
  switch (status) {
    case "Success":
      value = `<h1>Thank you! for Booking with Hotelio, We received your payment.</h1>`;
      break;
    case "Aborted":
      value = `<h1>Booking Aborted. Please try again.</h1>`;
      break;
    case "Failure":
      value = `<h1>Booking Failed. Please contact support for assistance.</h1>`;
      break;
    case "Invalid":
      value = `<h1>Invalid Booking. Please check your details and try again.</h1>`;
      break;
    default:
      value = `<h1>Unexpected status. Please try again or contact support.</h1>`;
      break;
  }
  return value;
};

// const compiledTemplate = handlebars.compile(template);

const TransactionDetails = `<div class="details">
<h3>Transaction Details</h3>
<table>
  <tr style="width: 100%">
    <th style="width: 25%">Transaction ID</th>
    <td style="width: 75%">{{txnId}}</td>
  </tr>
  <tr>
  <th style="width: 25%">Booking ID</th>
  <td style="width: 75%">{{bookingId}}</td>
</tr>
  <tr>
    <th>Date</th>
    <td>{{date}}</td>
  </tr>
  <tr>
    <th>Amount</th>
    <td>{{amt}}</td>
  </tr>
  <tr>
    <th>Payment Status</th>
    <td>{{payment_status}}</td>
  </tr>
</table>
</div>`;

const BookingDetails = `<div class="details">
<h3>Booking Details</h3>
<table>
  <tr>
    <th style="width: 25%">Booking ID</th>
    <td style="width: 75%">{{bookingId}}</td>
  </tr>
  <tr>
    <th>Hotel Name</th>
    <td>{{hotelName}}</td>
  </tr>
  <tr>
  <th>Guests</th>
  <td>{{guests}}</td>
</tr>
  <tr>
    <th>Booking Date</th>
    <td>{{bookingDate}}</td>
  </tr>
  <tr>
    <th>Room Type</th>
    <td>{{roomType}}</td>
  </tr>
  <tr>
    <th>Amount</th>
    <td>{{paidAmount}}</td>
  </tr>
</table>
</div>`;
// Sample data for rendering

module.exports = {
  TransactionDetails,
  BookingDetails,
  WebTemplate,
  dynamicPageTitle,
};
