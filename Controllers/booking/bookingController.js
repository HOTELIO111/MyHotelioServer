const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");
const {
  CreateThePaymentInfo,
} = require("../../helper/Payments/payementFuctions");
const ManageCancellationsWithPolicy = require("../../helper/booking/CancellationsPolicy");
const HotelioBookingCancel = require("../../helper/booking/CancellationsPolicy");
const {
  CreateBooking,
  CancelBooking,
  PreBookingFunction,
  CancelBookingAndProceed,
} = require("../../helper/booking/bookingHelper");
const {
  GetTheRoomAvailiabilityStats,
} = require("../../helper/hotel/roomManagementHelper");
const { BookingQue, RefundQueue } = require("../../jobs");
const bookingIdGenerate = require("./bookingIdGenerator");
const BillingSystem = require("./billingSystem");
const BookingSystem = require("./BookingSystem");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const { default: mongoose } = require("mongoose");

const RegisterBooking = async (req, res) => {
  const formData = req.body;

  try {
    const booknow = await CreateBooking(formData);

    if (booknow.error === true) return res.status(400).json(booknow);
    res.status(200).json(booknow);
  } catch (error) {
    res.status(500).json({ errro: true, message: error.message });
  }
};

// cancel booking
const CancleBooking = async (req, res) => {
  const { request, bookingId } = req.query;
  try {
    const bookingTime = await CancelBooking(bookingId, request);

    res.status(200).json(bookingTime);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Get all the booking
const GetBookings = async (req, res) => {
  const queryFields = req.query;

  try {
    let filter = {}; // Initialize an empty filter object

    // Check if there are any fields in req.query with values
    for (const field in queryFields) {
      if (queryFields[field]) {
        filter[field] = queryFields[field];
      }
    }

    let response;

    if (Object.keys(filter).length > 0) {
      // If filter has fields, use it to filter the results
      response = await Booking.find(filter);
    } else {
      // If no specific fields are provided, fetch all data
      response = await Booking.find({});
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

//get single booking by booking id
const GetSingleBooking = async (req, res) => {
  const { bookingId } = req.params;
  let booking = await Booking.findOne({ bookingId: bookingId });
  if (!booking) {
    return res.status(404).json({ error: true, message: "No booking found" });
  }
  res.status(200).json(booking);
};

const GetDeleteBooking = async (req, res) => {
  const { id } = req.query;

  try {
    const bookingHandler = new BookingSystem();
    let _deleted;
    if (!id) {
      _deleted = await bookingHandler.DeleteBooking();
    } else {
      _deleted = await bookingHandler.DeleteBookingById(id);
    }

    if (_deleted.error)
      return res.status(400).json({ error: true, message: _deleted.message });
    res.status(200).json(_deleted);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// genreate the booking id

const generateBookingId = async (req, res) => {
  try {
    const bookingId = await bookingIdGenerate();
    if (!bookingId)
      return res
        .status(404)
        .json({ error: true, message: "failed to generate booking id" });
    res.status(200).json({ error: false, message: "success", id: bookingId });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// create the pre booking
// const CreatePreBooking = async (req, res) => {
//   const bookingData = req.body;

//   // Check the booking availability and hold it for 10 minutes
//   const roomCount = await GetTheRoomAvailiabilityStats(
//     bookingData?.room,
//     bookingData?.bookingDate?.checkIn,
//     bookingData?.bookingDate?.checkOut
//   );

//   if (bookingData?.numberOfRooms > roomCount) {
//     return res
//       .status(404)
//       .json({ error: true, message: "Oops! Room not available" });
//   }

//   try {
//     const _bookingPre = await PreBookingFunction(bookingData);

//     res.status(200).json({ error: false, message: _bookingPre });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };
const CreatePreBooking = async (req, res) => {
  const bookingData = req.body;

  const bookingHandler = new BookingSystem();
  // Check the booking availability and hold it for 10 minutes
  const roomCount = await bookingHandler.GetRoomAvailiability(
    bookingData?.room,
    bookingData?.bookingDate?.checkIn,
    bookingData?.bookingDate?.checkOut
  );

  if (bookingData?.numberOfRooms > roomCount.data) {
    return res
      .status(404)
      .json({ error: true, message: "Oops! Room not available" });
  }
  try {
    const _bookingPre = await bookingHandler.CreatePreBooking(bookingData);
    // console.log("bookingPre", _bookingPre);

    if (_bookingPre.error) return res.status(400).json(_bookingPre);

    res
      .status(200)
      .json({ error: false, message: "success", data: _bookingPre.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// const CollectPaymentInfoAndConfirmBooking = async (req, res) => {
//   const formData = req.body;
//   const { paymentType } = req.params;
//   try {
//     // check the booking data
//     const _bookingData = await Booking.findOne({
//       bookingId: formData?.order_id,
//     });

//     if (!_bookingData)
//       return res
//         .status(404)
//         .json({ error: true, message: "No booking Found " });

//     // Store the payment info
//     const paymentReg = await CreateThePaymentInfo(formData);

//     // Add to the queue to handle payment for the booking
//     await BookingQue.add(
//       `Handle Payment For Booking No ${formData?.order_id}`,
//       {
//         ...formData,
//         paymentType,
//       }
//     );
//     // const paymentReg = formData;
//     if (paymentReg.order_status === "Success") {
//       res.status(200).json({
//         error: false,
//         message:
//           "Success: Payment received. Booking sent to the hotel for confirmation.",
//       });
//     } else {
//       res.status(200).json({
//         error: true,
//         data: paymentReg,
//         message:
//           "Payment Response indicates failure. Please wait for redirection or contact support.",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };
const CollectPaymentInfoAndConfirmBooking = async (req, res) => {
  const formData = req.body;
  const { paymentType } = req.params;
  try {
    if (!formData.order_id && !paymentType)
      return res.status(400).json({
        error: true,
        message: "payment type and payment response not met",
      });
    // adding payment status to the form data for sending payment status to the queue
    formData.paymentStatus = req.body.order_status;
    const bookingHandler = new BookingSystem();
    // Store the payment info
    const booking = await bookingHandler.FinalizeBooking(formData, paymentType);

    if (booking.error) return res.status(400).json(booking);
    res
      .status(200)
      .json({ error: false, message: booking.message, data: booking.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const ConfirmBookingPayAtHotel = async (req, res) => {
  try {
    const formData = req.body;
    const paymentType = "pay-at-hotel";

    const bookingHandler = new BookingSystem();
    const response = await bookingHandler.PayAtHotelBooking(
      formData,
      paymentType
    );

    if (response.error)
      return res.status(400).json({ error: true, message: response.message });

    res.status(200).json({
      error: false,
      message: "success",
      data: response.message,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// cancel Bookings
// const ManageCancelBooking = async (req, res) => {
//   try {
//     const formdata = req.body;
//     const { bookingid } = req.query;
//     const { id } = req.params;
//     if (!bookingid)
//       return res
//         .status(404)
//         .json({ error: true, message: "Booking Id is required " });

//     // make the booking cancellation in pending and send it in cancllations Queue
// const CancelBooking = await CancelBookingAndProceed(bookingid, id, formdata);

//     res.status(200).json({
//       error: false,
//       message: "success",
//       data: CancelBooking,
//     });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };
const ManageCancelBooking = async (req, res) => {
  try {
    const formdata = req.body;
    const { bookingid } = req.query;
    const { id } = req.params;
    if (!bookingid)
      return res
        .status(404)
        .json({ error: true, message: "Booking Id is required " });

    const newFormData = {
      reason: "Find The different booking with low price",
    };
    // make the booking cancellation in pending and send it in cancllations Queue
    const bookingsystem = new BookingSystem();
    const _CancelBooking = await bookingsystem.ManageCanellationsAndProceed(
      bookingid,
      id,
      newFormData
    );

    if (_CancelBooking.error)
      return res
        .status(400)
        .json({ error: true, message: _CancelBooking.message });

    res.status(200).json(_CancelBooking);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// calculate bill
const CalculateBilling = async (req, res) => {
  const {
    checkIn,
    checkOut,
    totalRooms,
    totalGuest,
    roomid,
    customer,
    agent,
    OfferId,
    addWalletOffer = true,
  } = req.query;
  try {
    const billing = new BillingSystem(
      checkIn,
      checkOut,
      totalRooms,
      totalGuest,
      roomid,
      customer,
      agent,
      OfferId
    );
    await billing.GetRoomInfoAndOffer(roomid, OfferId);
    if (addWalletOffer === "true") {
      await billing.customerWalletManage(customer);
    }
    const billingData = await billing.Calculate();
    if (billingData.error)
      return res
        .status(400)
        .json({ error: true, message: billingData.message });

    res.status(200).json({
      error: false,
      message: "success",
      data: billingData.data,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetUserhotelBookings = async (req, res) => {
  const { userid } = req.params;
  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userid) } },
      {
        $lookup: {
          from: "bookings",
          foreignField: "hotel",
          localField: "hotels",
          pipeline: [
            {
              $lookup: {
                from: "hotels",
                localField: "hotel",
                foreignField: "_id",
                pipeline: [
                  {
                    $lookup: {
                      from: "property-types",
                      localField: "hotelType",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            title: 1,
                          },
                        },
                      ],
                      as: "PropertyType",
                    },
                  },
                  {
                    $lookup: {
                      from: "room-categories",
                      localField: "rooms.roomType",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $lookup: {
                            from: "amenities",
                            localField: "amenties",
                            foreignField: "_id",
                            pipeline: [
                              {
                                $project: {
                                  _id: 1,
                                  title: 1,
                                },
                              },
                            ],
                            as: "Amenty",
                          },
                        },
                        {
                          $lookup: {
                            from: "facilities",
                            localField: "includeFacilities",
                            foreignField: "_id",
                            pipeline: [
                              {
                                $project: {
                                  _id: 1,
                                  title: 1,
                                },
                              },
                            ],
                            as: "Facility",
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            personAllowed: 1,
                            includeFacilities: 1,
                            minPrice: 1,
                            maxPrice: 1,
                            amenties: "$Amenty",
                            includeFacilities: "$Facility",
                            title: 1,
                          },
                        },
                      ],
                      as: "roomTypeData",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      hotelName: 1,
                      hotelType: { $arrayElemAt: ["$PropertyType", 0] },
                      hotelEmail: 1,
                      hotelMobileNo: 1,
                      address: 1,
                      location: 1,
                      rooms: {
                        $map: {
                          input: "$rooms",
                          as: "room",
                          in: {
                            counts: "$$room.counts",
                            roomType: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$roomTypeData",
                                    as: "roomTypes",
                                    cond: {
                                      $eq: [
                                        "$$roomTypes._id",
                                        "$$room.roomType",
                                      ],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                            price: "$$room.price",
                            status: "$$room.status",
                            additionAmenities: "$$room.additionAmenities",
                            roomConfig: "$$room.roomConfig",
                            additionalFacilties: "$$room.additionalFacilties",
                            _id: "$$room._id",
                          },
                        },
                      },
                      hotelCoverImg: 1,
                      hotelImages: 1,
                      checkOut: 1,
                      checkIn: 1,
                      hotelCoverImg: 1,
                      hotelImages: 1,
                    },
                  },
                ],
                as: "hotel",
              },
            },
            { $unwind: "$hotel" },
            { $sort: { createdAt: -1 } },
          ],
          as: "bookings",
        },
      },
      {
        $project: {
          bookings: "$bookings",
        },
      },
    ]);
    res
      .status(200)
      .json({ error: false, message: "success", data: response[0].bookings });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetUserhotelBookingsAdmin = async (req, res) => {
  try {
    const response = await Booking.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "property-types",
                localField: "hotelType",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      title: 1,
                    },
                  },
                ],
                as: "PropertyType",
              },
            },
            {
              $lookup: {
                from: "room-categories",
                localField: "rooms.roomType",
                foreignField: "_id",
                pipeline: [
                  {
                    $lookup: {
                      from: "amenities",
                      localField: "amenties",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            title: 1,
                          },
                        },
                      ],
                      as: "Amenty",
                    },
                  },
                  {
                    $lookup: {
                      from: "facilities",
                      localField: "includeFacilities",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            title: 1,
                          },
                        },
                      ],
                      as: "Facility",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      personAllowed: 1,
                      includeFacilities: 1,
                      minPrice: 1,
                      maxPrice: 1,
                      amenties: "$Amenty",
                      includeFacilities: "$Facility",
                      title: 1,
                    },
                  },
                ],
                as: "roomTypeData",
              },
            },
            {
              $project: {
                _id: 1,
                hotelName: 1,
                hotelType: { $arrayElemAt: ["$PropertyType", 0] },
                hotelEmail: 1,
                hotelMobileNo: 1,
                address: 1,
                location: 1,
                rooms: {
                  $map: {
                    input: "$rooms",
                    as: "room",
                    in: {
                      counts: "$$room.counts",
                      roomType: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$roomTypeData",
                              as: "roomTypes",
                              cond: {
                                $eq: ["$$roomTypes._id", "$$room.roomType"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      price: "$$room.price",
                      status: "$$room.status",
                      additionAmenities: "$$room.additionAmenities",
                      roomConfig: "$$room.roomConfig",
                      additionalFacilties: "$$room.additionalFacilties",
                      _id: "$$room._id",
                    },
                  },
                },
                hotelCoverImg: 1,
                hotelImages: 1,
                checkOut: 1,
                checkIn: 1,
                hotelCoverImg: 1,
                hotelImages: 1,
              },
            },
          ],
          as: "hotel",
        },
      },
      { $unwind: "$hotel" },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const RefundTesting = async (req, res) => {
  const _updated = req.body;
  try {
    await RefundQueue.add(
      `Handle The Cancellations refund of ${_updated.bookingId}`,
      {
        ..._updated,
      }
    );
    res.status(200).json({
      error: false,
      message: "success",
      data: "successfully added in queue",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  RegisterBooking,
  CancleBooking,
  GetBookings,
  GetDeleteBooking,
  generateBookingId,
  GetSingleBooking,
  CreatePreBooking,
  ConfirmBookingPayAtHotel,
  CollectPaymentInfoAndConfirmBooking,
  ManageCancelBooking,
  CalculateBilling,
  GetUserhotelBookings,
  GetUserhotelBookingsAdmin,
  RefundTesting,
};
