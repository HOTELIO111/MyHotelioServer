const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");

const PartnerHotelsInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await HotelModel.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "hotelAnalytics",
          totalHotels: { $sum: 1 },
          totalApprovedHotels: {
            $sum: {
              $cond: {
                if: { $eq: ["$isAdminApproved", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalInactiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", false] },
                then: 1,
                else: 0,
              },
            },
          },
          totalActiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalApprovedAndActive: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$status", true] },
                    { $eq: ["$isAdminApproved", true] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalHotels: "$totalHotels",
          totalApprovedHotels: "$totalApprovedHotels",
          totalInactiveHotel: "$totalInactiveHotel",
          totalActiveHotel: "$totalActiveHotel",
          totalApprovedAndActive: "$totalApprovedAndActive",
        },
      },
    ]);

    res
      .status(200)
      .json({ error: false, message: "success", data: response[0] });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DashboardCountings = async (req, res) => {
  const { vendorid } = req.params;
  const currentDate = new Date();
  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      {
        $lookup: {
          from: "hotels",
          foreignField: "_id",
          localField: "hotels",
          pipeline: [
            {
              $lookup: {
                from: "room-configs",
                foreignField: "_id",
                localField: "rooms.roomConfig",
                pipeline: [
                  {
                    $group: {
                      _id: "$will",
                      total: { $sum: "$rooms" },
                    },
                  },
                ],
                as: "roomConfig",
              },
            },
            // Yha se project krna hai hotel ke room count se increased or decreased count minus krke

            {
              $project: {
                $map: {
                  input: "$rooms",
                  as: "roomsArray",
                  in: {
                    $cond: {
                      if: "",
                    },
                  },
                },
              },
            },
          ],
          as: "hotels",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "hotels._id",
          foreignField: "hotel",
          as: "bookingList",
        },
      },

      {
        $project: {
          totalRooms: {
            $sum: {
              $map: {
                input: "$hotels",
                as: "hotelData",
                in: { $sum: "$$hotelData.rooms.counts" },
              },
            },
          },
          hotels: 1,
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const HotelroomInfoAnalytics = async (req, res) => {
  const { vendorid } = req.params;

  try {
    // const response = await VendorModel.aggregate([
    //   { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
    //   {
    //     $lookup: {
    //       from: "hotels",
    //       localField: "hotels",
    //       pipeline: [
    //         {
    //           $lookup: {
    //             from: "bookings",
    //             localField: "_id",
    //             foreignField: "hotel",
    //             pipeline: [
    //               {
    //                 $group: {
    //                   _id: "$bookingStatus",
    //                   totalRooms: { $sum: "$numberOfRooms" },
    //                   totalBookings: { $sum: 1 },
    //                 },
    //               },
    //             ],
    //             as: "bookings",
    //           },
    //         },
    //         // {
    //         //   $group: {
    //         //     _id: "$bookingStatus",
    //         //     totalBookings: { $sum: 1 },
    //         //     totalRoomsBooked: { $sum: "$numberOfRooms" },
    //         //   },
    //         // },
    //       ],
    //       foreignField: "_id",
    //       as: "bookingStats",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "hotels",
    //       localField: "hotels",
    //       foreignField: "_id",
    //       as: "totalHotels",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "hotels",
    //       foreignField: "_id",
    //       localField: "hotels",
    //       pipeline: [
    //         {
    //           $unwind: "$rooms", // Unwind the rooms array
    //         },
    //         {
    //           $group: {
    //             _id: "$rooms.roomType",
    //             allRooms: { $sum: "$rooms.counts" }, // Push all rooms into a new array
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             allRooms: 1,
    //             totalRooms: { $sum: "$allRooms" },
    //           },
    //         },
    //       ],
    //       as: "hotels",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "room-categories",
    //       foreignField: "_id",
    //       localField: "hotels._id",
    //       as: "roomTypes",
    //     },
    //   },
    //   {
    //     $project: {
    //       _asperrooms: {
    //         $map: {
    //           input: "$hotels",
    //           as: "singleRoomData",
    //           in: {
    //             _id: {
    //               $let: {
    //                 vars: {
    //                   roomdata: {
    //                     $arrayElemAt: [
    //                       {
    //                         $filter: {
    //                           input: "$roomTypes",
    //                           as: "singleRoomType",
    //                           cond: {
    //                             $eq: [
    //                               "$$singleRoomData._id",
    //                               "$$singleRoomType._id",
    //                             ],
    //                           },
    //                         },
    //                       },
    //                       0,
    //                     ],
    //                   },
    //                 },
    //                 in: "$$roomdata.title",
    //               },
    //             },
    //             counts: "$$singleRoomData.allRooms",
    //           },
    //         },
    //       },
    //       totalHote: "$totalHotels",
    //       totalRooms: { $sum: "$hotels.totalRooms" },
    //       totalHotels: "$bookingStats",
    //     },
    //   },
    // ]);
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      // Total rooms in hotel
      {
        $lookup: {
          from: "bookings",
          localField: "hotels",
          foreignField: "hotel",
          pipeline: [
            {
              $group: {
                _id: "$bookingStatus",
                totalBookings: { $sum: 1 },
                totalRooms: { $sum: "$numberOfRooms" },
              },
            },
          ],
          as: "bookings",
        },
      },

      {
        $lookup: {
          from: "hotels",
          foreignField: "_id",
          localField: "hotels",
          pipeline: [
            { $unwind: "$rooms" },
            {
              $group: {
                _id: "$rooms.roomType",
                rooms: { $sum: "$rooms.counts" },
              },
            },
          ],
          as: "totalRooms",
        },
      },
      {
        $lookup: {
          from: "hotels",
          foreignField: "_id",
          localField: "hotels",
          as: "hotels",
        },
      },
      {
        $addFields: {
          totalHotels: { $size: "$hotels" },
          totalRooms: { $sum: "$totalRooms.rooms" },
          roomsByRoomType: "$totalRooms",
        },
      },
      {
        $project: {
          totalHotels: 1,
          totalRooms: 1,
          roomsByRoomType: 1,
          bookings: "$bookings",
          totalBookings: { $sum: "$bookings.totalBookings" },
          totalRoomsBooked: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$bookings",
                  as: "singleBookings",
                  cond: { $eq: ["$$singleBookings._id", "confirmed"] },
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const HotelRoomInfoByDateAnalytics = async (req, res) => {
  const { vendorid } = req.params;
  const { from, to } = req.query;
  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      {
        $lookup: {
          from: "hotels",
          let: { hotelId: "$hotels" },
          localField: "hotels",
          foreignField: "_id",
          pipeline: [
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
                            { from: { $lte: new Date(to) } }, // Changed $gte to $lte
                            { to: { $gte: new Date(from) } }, // Changed $gte to $lte
                          ],
                        },
                        {
                          $and: [
                            { from: { $gte: new Date(from) } },
                            { to: { $lte: new Date(to) } },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    $group: {
                      _id: "$will",
                      totalRooms: { $sum: "$rooms" },
                    },
                  },
                ],

                as: "roomCountData",
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
                    },
                  },
                ],
                as: "roomTypeData",
              },
            },
            {
              $project: {
                totalRooms: { $sum: "$rooms.counts" },
                totalRoomDecreased: {
                  $sum: {
                    $let: {
                      vars: {
                        totalConfigData: {
                          $filter: {
                            input: "$roomCountData",
                            as: "roomconf",
                            cond: { $eq: ["$$roomconf._id", "dec"] },
                          },
                        },
                      },
                      in: { $sum: "$$totalConfigData.totalRooms" }, // Assuming totalRooms is the field in totalConfigData
                    },
                  },
                },
                totalIncreasedRoom: {
                  $sum: {
                    $let: {
                      vars: {
                        totalConfigData: {
                          $filter: {
                            input: "$roomCountData",
                            as: "roomconf",
                            cond: { $eq: ["$$roomconf._id", "inc"] },
                          },
                        },
                      },
                      in: { $sum: "$$totalConfigData.totalRooms" },
                    },
                  },
                },
                // roomCountData: 1,
              },
            },
          ],
          as: "allHotels",
        },
      },
      {
        $lookup: {
          from: "bookings",
          let: { hotels: "$hotels" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$hotel", "$$hotels"] },
                    {
                      $gte: [
                        "$dateOfBooking",
                        new Date(new Date(from).setHours(0, 0, 0, 0)),
                      ],
                    },
                    {
                      $lt: [
                        "$dateOfBooking",
                        new Date(new Date(to).setHours(24, 0, 0, 0)),
                      ],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$bookingStatus",
                totalBookings: { $sum: 1 },
                totalRoomsBooked: { $sum: "$numberOfRooms" },
              },
            },
          ],
          as: "bookings",
        },
      },
      {
        $project: {
          bookings: 1,
          totalRooms: { $sum: "$allHotels.totalRooms" },
          totalIncreasedRooms: { $sum: "$allHotels.totalIncreasedRooms" },
          totalDecreasedRooms: { $sum: "$allHotels.totalDecreasedRooms" },
          availableRooms: {
            $add: [
              { $subtract: ["$totalRooms", "$totalDecreasedRooms"] },
              "$totalIncreasedRooms",
            ],
          },
        },
      },
    ]);

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// todays: {
//   $sum: {
//     $cond: {
//       if: {
//         $and: [
//           {
//             $gte: [
//               "$dateOfBooking",
//               new Date(new Date().setHours(0, 0, 0, 0)),
//             ],
//           },
//           {
//             $lt: [
//               "$dateOfBooking",
//               new Date(new Date().setHours(24, 0, 0, 0)),
//             ],
//           },
//         ],
//       },
//       then: 1,
//       else: 0,
//     },
//   },
// },

const BookingAnalyticsPartner = async (req, res) => {
  const { vendorid } = req.params;

  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      {
        $lookup: {
          from: "bookings",
          foreignField: "hotel",
          localField: "hotels",
          pipeline: [
            {
              $group: {
                _id: "$bookingStatus",
                total: { $sum: "$numberOfRooms" },
              },
            },
          ],
          as: "bookings",
        },
      },
      {
        $project: {
          _status: "$bookings",
          allBookings: { $sum: "$bookings.total" },
        },
      },
    ]);

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  PartnerHotelsInfo,
  DashboardCountings,
  HotelroomInfoAnalytics,
  BookingAnalyticsPartner,
  HotelRoomInfoByDateAnalytics,
};
