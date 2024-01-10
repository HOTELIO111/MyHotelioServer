const Booking = require("../../Model/booking/bookingModel");

const ManageCancellationsWithPolicy = async (bookingid) => {
  try {
    const calculate = await Booking.aggregate([
      { $match: { bookingId: bookingid } },
      {
        $lookup: {
          from: "paymentsresponses",
          foreignField: "_id",
          localField: "payment.payments",
          pipeline: [
            {
              $group: {
                _id: "$_id",
                sum: { $sum: "$amount" },
              },
            },
          ],
          as: "paymentTable",
        },
      },
      {
        $project: {
          amountRefund: {
            $switch: {
              branches: [
                {
                  case: { $lte: ["$numberOfRooms", 4] },
                  then: {
                    $switch: {
                      branches: [
                        // if the cancellationDueDate is  between  24 hours from current time it will be like booking canceling before 24 hours
                        {
                          case: {
                            $and: [
                              { $gte: ["$cancellationDueDate", new Date()] },
                              {
                                $lt: [
                                  "$cancellationDueDate",
                                  new Date(Date.now() + 24 * 60 * 60 * 1000),
                                ],
                              },
                            ],
                          },
                          then: { $arrayElemAt: ["$paymentTable.sum", 0] }, // No deduction if canceled within 24 hours of check-in
                        },
                        // if the booking canceling after the cancellation due date
                        {
                          case: { $lte: ["$cancellationDueDate", new Date()] },
                          then: 0, // Deduct penalty charge if canceled after cancellation due date
                        },
                        // if the booking canceling before cancellation due date
                        {
                          case: { $gte: ["$cancellationDueDate", new Date()] },
                          then: { $arrayElemAt: ["$paymentTable.sum", 0] },
                        },
                      ],
                      default: 0,
                    },
                  },
                },
              ],
              default: {
                $switch: {
                  branches: [
                    // if the cancellation is doing between 15 days
                    {
                      case: {
                        $and: [
                          { $gte: ["$cancellationDueDate", new Date()] },
                          {
                            $lt: [
                              "$cancellationDueDate",
                              new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                            ],
                          },
                        ],
                      },
                      then: 0, // No deduction if canceled within 24 hours of check-in
                    },
                    // If the Cancellation doing before 15 days to 30 days
                    {
                      case: {
                        $and: [
                          {
                            $gte: [
                              "$cancellationDueDate",
                              new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                            ],
                          },
                          {
                            $lt: [
                              "$cancellationDueDate",
                              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            ],
                          },
                        ],
                      },
                      then: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: "$paymentTable.sum",
                              as: "amount",
                              in: { $divide: ["$$amount", 2] },
                            },
                          },
                          0,
                        ],
                      }, // No deduction if canceled within 24 hours of check-in
                    },
                    // if the cancellation done after the cancellation date
                    {
                      case: { $lte: ["$cancellationDueDate", new Date()] },
                      then: 0, // Deduct penalty charge if canceled after cancellation due date
                    },
                    // if the cancellation done before the cancellation due date or before 30 days
                    {
                      case: { $gte: ["$cancellationDueDate", new Date()] },
                      then: { $arrayElemAt: ["$paymentTable.sum", 0] },
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      },
    ]);

    return calculate[0];
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
