const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");
require("dotenv").config();
const { MobileNotification, EmailNotification } = require("../../jobs");

const CreatePreBooking = async (data) => {
  const paymentData = data?.data;
  const paymentType = data?.data?.paymentType;
  console.log(paymentType);
  const bookingData = await Booking.aggregate([
    { $match: { bookingId: paymentData?.order_id } },
  ]);
  const reciepent = await bookingData[0]?.guest?.email;
  console.log(`working on booking ${data.name}`);
  if (paymentType === "pay-at-hotel") {
    await updateBookingPayAtHotel(paymentData, bookingData);
    EmailNotification.add(
      `send mail to customer on email ${bookingData[0]?.guest?.email}`,
      {
        to: reciepent,
        subject: "Hotel Booking Confirmation - Your Travel Partner: Hotelio",
      }
    );
    console.log("Booking confirmed and you can pay it on hotel");
  } else {
    if (paymentData?.order_status === "Success") {
      await updateBookingConfirmation(paymentData, bookingData);

      await EmailNotification.add(
        `send mail to customer on email ${bookingData?.guest?.email}`,
        {
          to: reciepent,
          subject: "Hotel Booking Confirmation - Your Travel Partner: Hotelio",
        }
      );
      console.log("Booking confirmed and Payment recieved successfully ");
    } else {
      await UpdateTheBookingFailed(paymentData, bookingData);
      console.log("Booking confirmed and Payment Failed ");
    }
  }
};

const updateBookingConfirmation = async (formData, bookingData) => {
  try {
    // Extract necessary information from the booking data
    const totalAmount = bookingData[0].amount;

    // Update hotel and booking documents in parallel
    const [updatedHotel, updatedBooking] = await Promise.all([
      HotelModel.findByIdAndUpdate(bookingData[0].hotel, {
        $push: { bookings: bookingData[0]._id },
      }),
      Booking.findByIdAndUpdate(bookingData[0]._id, {
        bookingStatus: "confirmed",
        payment: {
          paymentType: formData?.paymentType,
          totalAmount: totalAmount,
          paidAmount: formData?.amount,
          balanceAmount: totalAmount - formData?.amount,
        },
      }),
    ]);

    // Return updated data
    return {
      hotelData: updatedHotel,
      booking: updatedBooking,
    };
  } catch (error) {
    // Handle errors gracefully
    console.error("Error updating booking confirmation:", error.message);
    throw error; // Propagate the error for higher-level handling
  }
};

const UpdateTheBookingFailed = async (formdata, bookingData) => {
  try {
    const findBookingAndUpdate = await Booking.findOneAndUpdate(
      {
        bookingId: formdata?.order_id,
      },
      {
        bookingStatus: "failed",
        payment: {
          paymentType: formdata?.paymentType,
          totalamount: bookingData[0].amount,
          paidamount: formdata?.amount,
          balanceAmt: bookingData[0].amount - formdata?.amount,
        },
      }
    );
    return { booking: findBookingAndUpdate };
  } catch (error) {
    console.error("Error updating booking confirmation:", error.message);
    throw error;
  }
};

const updateBookingPayAtHotel = async (formdata, bookingData) => {
  try {
    const findTheBookingAndUpdate = await Booking.findByIdAndUpdate(
      {
        bookingId: formdata?.order_id,
      },
      {
        bookingStatus: "confirmed",
        payment: {
          paymentType: "pay-at-hotel",
          totalamount: bookingData[0].amount,
          paidamount: 0,
          balanceAmt: bookingData[0].amount,
        },
      }
    );

    return { booking: findTheBookingAndUpdate };
  } catch (error) {
    console.error("Error updating booking confirmation:", error.message);
    throw error;
  }
};

// console.log(paymentData);
// if (paymentData?.order_status === "Success") {
//   // store the booking id in the hotel  and make the booking status confirm
//   // get booking data
//   const findBookingAndUpdate = await Booking.aggregate([
//     { $match: { bookingId: paymentData?.order_id } },
//   ]);

//   const [updateHotel, updateBooking] = await Promise.all([
//     HotelModel.findByIdAndUpdate(findBookingAndUpdate[0].hotel, {
//       $push: { bookings: findBookingAndUpdate[0]._id },
//     }),
//     Booking.findByIdAndUpdate(findBookingAndUpdate[0]._id, {
//       bookingStatus: "confirmed",
//     }),
//   ]);

//   await EmailNotification.add("booking confirmed", {
//     to: findBookingAndUpdate[0]?.guest?.email,
//     subject: `Booking Confirmed On ${new Date(
//       findBookingAndUpdate[0].bookingDate?.checkIn
//     ).getDate()}-${new Date(
//       findBookingAndUpdate[0].bookingDate?.checkOut
//     ).getDate()} `,
//     body: "Your booking was confrmed",
//   });

//   // notifiy the Customer on Mobile for Booking Confirm

//   // data.data?.order_status
//   //  ----------------Payment is success ---------------
//   // store the booking id in the hotel  and make the booking status confirm
//   // notify the vendor about his hotel booking recieved
//   // ---------------------payment if failed  ---------------------
//   // make the booking status failed
//   // notifiy the customer about this failed
// } else {
//   // make the booking status failed
//   // notifiy the customer about this failed
//   const findBookingAndUpdate = await Booking.findOneAndUpdate(
//     {
//       bookingId: paymentData?.order_id,
//     },
//     {
//       bookingStatus: "failed",
//     }
//   );
// }
module.exports = { CreatePreBooking };
