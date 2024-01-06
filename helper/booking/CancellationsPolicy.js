const Booking = require("../../Model/booking/bookingModel");

// class HotelioBookingCancel {
//   constructor(bookingid, reason) {
//     this.bookingid = bookingid;
//     this.isCanceled = false;
//     this.reason = reason;
//     this.bookingDetails = null;
//   }

//   async getBookingDetials() {
//     this.bookingDetails = await Booking.findOne({ bookingId: this.bookingid });
//     try {
//       if (!this.bookingDetails) {
//         console.log("booking is not found");
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   }

//   async cancelBooking() {
//     if (this.bookingDetails) {
//       await this.getBookingDetials();
//     } else {
//       if (
//         this.bookingDetails &&
//         this.bookingDetails.bookingStatus !== "canceled"
//       ) {
//         console.log("cancel kar du kay ");
//         // await Booking.findByIdAndUpdate(this.bookingDetails._id, {
//         //   bookingStatus: "canceled",
//         //   cancellation: {
//         //     status: "canceled",
//         //     requestedBy: this.bookingDetails.customer,
//         //     reason: this.reason,
//         //     requestedDate: new Date(),
//         //     processedDate: new Date(),
//         //     notes: "Your Booking was canceled",
//         //     refundAmount: this.bookingDetails.amount,
//         //   },
//         // });
//       }
//     }
//   }

//   async refundAmount() {
//     if (!this.bookingDetails) {
//       await this.getBookingDetials();
//     } else {
//       const { amount, bookingDate, payment, numberOfRooms, dateOfBooking } =
//         this.bookingDetails;
//       //   calculate the data before canceling
//       const Time =
//         (new Date(bookingDate?.checkIn) - new Date()) / (1000 * 60 * 60 * 24);
//       const bookingTime =
//         new Date(bookingDate.checkIn) -
//         new Date(dateOfBooking) / (1000 * 60 * 60 * 24);
//     }
//   }
// }

const ManageCancellationsWithPolicy = async (bookingid) => {
  try {
    const calculate = await Booking.aggregate([
      { $match: { bookingId: bookingid } },
      {
        $project: {
          deductAmt: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $gte: [
                          "$bookingDate.checkIn",
                          new Date(), // Assuming cancellationDueDate is a Date field in your Booking collection
                        ],
                      },
                      {
                        $lt: [
                          "$bookingDate.checkIn",
                          new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours in milliseconds
                        ],
                      },
                    ],
                  },
                  then: 0, // No deduction if canceled within 24 hours of check-in
                },
              ],
              default: "No amount charges",
            },
          },
        },
      },
    ]);

    return calculate;
  } catch (error) {
    return error.message;
  }
};

module.exports = ManageCancellationsWithPolicy;

// const bookingid = "your_booking_id"; // Replace with the actual booking id

// const cancellationQuery = await Booking.aggregate([
//   { $match: { bookingId: bookingid } },
//   {
//     $project: {
//       deductAmt: {
//         $switch: {
//           branches: [
//             {
//               case: {
//                 $and: [
//                   {
//                     $gte: [
//                       "$cancellationDueDate",
//                       new Date(), // Assuming cancellationDueDate is a Date field in your Booking collection
//                     ],
//                   },
//                   {
//                     $lt: [
//                       "$cancellationDueDate",
//                       new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours in milliseconds
//                     ],
//                   },
//                 ],
//               },
//               then: 0, // No deduction if canceled within 24 hours of check-in
//             },
//             {
//               case: {
//                 $gte: [
//                   "$cancellationDueDate",
//                   new Date(), // Assuming cancellationDueDate is a Date field in your Booking collection
//                 ],
//               },
//               then: "$penaltyCharge", // Deduct penalty charge if canceled after cancellation due date
//             },
//             {
//               case: {
//                 $lt: [
//                   "$cancellationDueDate",
//                   new Date(), // Assuming cancellationDueDate is a Date field in your Booking collection
//                 ],
//               },
//               then: "$completeBookingAmount", // Deduct complete booking amount if canceled within 24 hours of check-in
//             },
//           ],
//           default: "$completeBookingAmount", // Default case if none of the conditions match
//         },
//       },
//     },
//   },
// ]);

// console.log(cancellationQuery);
