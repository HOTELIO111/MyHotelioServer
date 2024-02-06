const HandleResponse = require("../../Controllers/Ccavenue/ResponseHandlersFunc");
const bookingIdGenerate = require("../../Controllers/booking/bookingIdGenerator");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");
const { EmailNotification } = require("../../jobs");
const ManageCancellationsWithPolicy = require("./CancellationsPolicy");

const CreateBooking = async (formData, id, status) => {
  try {
    const isCreated = await Booking.findByIdAndUpdate(
      id,
      {
        ...formData,
        bookingStatus: status,
      },
      {
        new: true,
      }
    );
    if (!isCreated) return { error: true, message: "Not registered" };

    // Add the booking id in customer and vendor data
    const onVendor = await HotelModel.findOneAndUpdate(
      { _id: isCreated.hotel },
      { $push: { bookings: isCreated._id } }
    );

    if (!onVendor)
      return { error: true, message: "Booking not created! Try Again" };

    return { error: false, message: "Success", data: isCreated };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const PreBookingFunction = async (formData) => {
  try {
    // Generate Booking id
    const bookingID = await bookingIdGenerate();
    const isCreated = await new Booking({
      ...formData,
      bookingId: bookingID,
      bookingStatus: "pending",
      cancellationDueDate:
        new Date(formData.bookingDate.checkIn).getTime() - 24 * 60 * 60 * 1000,
    }).save();
    if (!isCreated) return { error: true, message: "Not registered" };

    // Add the booking id in customer and vendor data
    const onCustomer = await CustomerAuthModel.findOneAndUpdate(
      { _id: isCreated.customer },
      { $push: { bookings: isCreated._id } }
    );

    if (!onCustomer)
      return { error: true, message: "Booking not created! Try Again" };

    return { error: false, message: "Success", data: isCreated };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const CheckBookingAvailability = async (req, res, next) => {
  try {
    const data = req.body;
    const checkIn = new Date(data.bookingDate.checkIn);
    const checkOut = new Date(data.bookingDate.checkOut);

    const bookingsWithinDateRange = await Booking.find({
      room: data.room,
      hotel: data.hotel,
      bookingStatus: "confirmed",
      $or: [
        {
          "bookingDate.checkIn": { $gte: checkIn, $lte: checkOut },
        },
        {
          "bookingDate.checkOut": { $gte: checkIn, $lte: checkOut },
        },
      ],
    }).populate({
      path: "hotel customer",
    });
    //  total rooms used
    const usedRooms = bookingsWithinDateRange
      .map((x) => x.numberOfRoom)
      .reduce((a, b) => a + b, 0);

    // check in the room
    const hotelData = await HotelModel.findOne({
      _id: data.hotel,
      rooms: {
        $elemMatch: {
          _id: data.room,
          counts: { $gte: usedRooms + data.numberOfRooms },
        },
      },
    }).populate("rooms.roomType");

    if (!hotelData)
      return res
        .status(404)
        .json({ error: true, message: "Room not Available" });

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Handle booking cancellation policy
const handleCancellationPolicy = async (bookingId) => {
  const booking = await Booking.findOne({ bookingId: bookingId });

  if (!booking) {
    return "Booking not found.";
  }

  const roomsBooked = booking.numberOfRooms;

  // Check cancellation policy and apply refund policy
  const currentDate = new Date();

  const bookingDate = booking?.bookingDate?.checkIn;
  const difference = bookingDate - currentDate;
  const hoursDifference = difference / (1000 * 3600);

  const sumOfAdditionalCharges = Object.values(
    booking.additionalCharges
  ).reduce((a, b) => a + b, 0);

  const refund =
    parseFloat(booking.amount) - parseFloat(sumOfAdditionalCharges);
  return sumOfAdditionalCharges;
};

// Cancellation booking
const CancelBooking = async (bookingId, request) => {
  try {
    // Get booking
    const isBooking = await Booking.findOne({ bookingId: bookingId });
    if (!isBooking)
      return { error: true, message: "No booking found with this id" };

    // Make the refund policy
    const timeDifferenceFromBooking = await handleCancellationPolicy(bookingId);
    return timeDifferenceFromBooking;
    // -------------------------working on this ------------------------------
  } catch (error) {
    return error;
  }
};

const CancelBookingAndProceed = async (bookingid, id, fromdata) => {
  try {
    const checkTheRefundPolicy = await ManageCancellationsWithPolicy(bookingid);
    if (checkTheRefundPolicy.amountRefund === 0) {
      const _bookingUpdate = await Booking.findOneAndUpdate(
        { bookingId: bookingid },
        {
          bookingStatus: "canceled",
          "cancellation.status": "canceled",
          "cancellation.requestedBy": id,
          "cancellation.requestedDate": new Date(),
          "cancellation.reason": fromdata.reason,
          "cancellation.notes": "Booking is canceled ",
          "cancellation.refundAmount": checkTheRefundPolicy?.amountRefund,
          "cancellation.refundStatus": "success",
        },
        { new: true }
      );
    }

    //   // ================================ Notifcation ==========================
    //   EmailNotification.add(
    //     `${bookingid} Booking Canceled Notification`,
    //     _bookingUpdate
    //   );
    // } else {
    //   const _bookingpending = await Booking.findOneAndUpdate(
    //     { bookingId: bookingid },
    //     {
    //       bookingStatus: "canceled",
    //       "cancellation.status": "pending",
    //       "cancellation.requestedBy": id,
    //       "cancellation.requestedDate": new Date(),
    //       "cancellation.reason": fromdata.reason,
    //       "cancellation.notes": "",
    //       "cancellation.refundAmount": "",
    //       "cancellation.refundStatus": "",
    //     },
    //     { new: true }
    //   );
    // }

    return checkTheRefundPolicy;
  } catch (error) {
    return error;
  }
};

const GetTheSingleBookingPopulated = async (bookingId) => {
  try {
    const response = await Booking.aggregate([
      { $match: { bookingId: bookingId } },
      {
        $lookup: {
          from: "hotels",
          foreignField: "_id",
          localField: "hotel",
          pipeline: [
            {
              $lookup: {
                from: "hotel-partners",
                localField: "vendorId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      email: 1,
                      mobileNo: 1,
                      kycVerified: 1,
                      role: 1,
                      status: 1,
                    },
                  },
                ],
                as: "vendorData",
              },
            },
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
                      title: 1,
                      includeFacilities: 1,
                      minPrice: 1,
                      maxPrice: 1,
                      amenties: "$Amenty",
                      includeFacilities: "$Facility",
                    },
                  },
                ],
                as: "roomTypeData",
              },
            },
            {
              $lookup: {
                from: "room-configs",
                localField: "rooms.roomConfig",
                foreignField: "_id",
                pipeline: [
                  {
                    $match: {
                      $or: [
                        {
                          $and: [
                            { from: { $gte: new Date() } },
                            { from: { $lte: new Date() } },
                          ],
                        },
                        {
                          $and: [
                            { to: { $gte: new Date() } },
                            { to: { $lte: new Date() } },
                          ],
                        },
                      ],
                    },
                  },
                  // Yha pe Room Calculation baki hai wo kro uske baad booking ka caculated nikalo then sab ok hai
                ],
                as: "roomCountData",
              },
            },
            {
              $project: {
                _id: 1,
                // vendorId: { $arrayElemAt: ["$vendorData", 0] },
                // isAddedBy: 1,
                hotelName: 1,
                hotelType: { $arrayElemAt: ["$PropertyType", 0] },
                hotelEmail: 1,
                hotelMobileNo: 1,
                // locality: 1,
                address: 1,
                // city: 1,
                // state: 1,
                // country: 1,
                zipCode: 1,
                location: 1,
                rooms: {
                  $map: {
                    input: "$rooms",
                    as: "room",
                    in: {
                      counts: {
                        $sum: {
                          $subtract: [
                            { $toInt: "$$room.counts" }, // Convert to integer if not already
                            {
                              $let: {
                                vars: {
                                  decreasedArray: {
                                    $filter: {
                                      input: "$roomCountData",
                                      as: "roomCo",
                                      cond: {
                                        $and: [
                                          {
                                            $eq: [
                                              "$$roomCo.roomid",
                                              "$$room._id",
                                            ],
                                          },
                                          { $eq: ["$$roomCo.will", "dec"] },
                                        ],
                                      },
                                    },
                                  },
                                  increasedArray: {
                                    $filter: {
                                      input: "$roomCountData",
                                      as: "roomCo",
                                      cond: {
                                        $and: [
                                          {
                                            $eq: [
                                              "$$roomCo.roomid",
                                              "$$room._id",
                                            ],
                                          },
                                          { $eq: ["$$roomCo.will", "inc"] },
                                        ],
                                      },
                                    },
                                  },
                                },
                                in: {
                                  $sum: {
                                    $subtract: [
                                      { $sum: "$$decreasedArray.rooms" },
                                      { $sum: "$$increasedArray.rooms" },
                                    ],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
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
                      roomCount: {
                        $filter: {
                          input: "$roomCountData",
                          as: "roomCo",
                          cond: { $eq: ["$$roomCo.roomid", "$$room._id"] },
                        },
                      },
                      _id: "$$room._id",
                    },
                  },
                },
                hotelCoverImg: 1,
                // hotelImages: 1,
                // checkOut: 1,
                // checkIn: 1,
                // cancellationPrice: 1,
                // termsAndCondition: 1,
                // hotelFullySanitized: 1,
                // notSupportDiscrimination: 1,
                // validAndTrueData: 1,
                // hotelMapLink: 1,
                // isAdminApproved: 1,
                // isPostpaidAllowed: 1,
                // status: 1,
                // hotelRatings: 1,
                // reviews: 1,
                // createdAt: 1,
                // discription: 1,
              },
            },
          ],
          as: "hotel",
        },
      },
      { $unwind: "$hotel" },
    ]);
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GenerateTemplate = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const bookingData = await GetTheSingleBookingPopulated(bookingId);
    const handler = new HandleResponse("part-pay", bookingData);
    const generateTemplate = await handler.RenderSuccessPage(
      83294923922,
      "10-20-2024",
      200000,
      "success",
      bookingId
    );
    res.send(generateTemplate);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateBooking,
  CheckBookingAvailability,
  handleCancellationPolicy,
  CancelBooking,
  PreBookingFunction,
  CancelBookingAndProceed,
  GetTheSingleBookingPopulated,
  GenerateTemplate,
  // CollectPaymentAndConfirm,
};
