const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const {
  GetAllRoomWiseAmenities,
  GetRoomAvaliable,
} = require("../../helper/hotel/hotel_helper");
const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");
const Booking = require("../../Model/booking/bookingModel");
const PopularLocations = require("../../Model/popularLocations/Locations");

// const GetSearchHotels = async (req, res) => {
//   const {
//     location,
//     checkIn,
//     checkOut,
//     lat,
//     lng,
//     totalRooms,
//     roomType,
//     priceMin,
//     priceMax,
//     hotelType,
//     amenities,
//     payment,
//     kmRadius,
//     page,
//     pageSize,
//     sort,
//     fields,
//   } = req.query;
//   const skip = (page - 1) * pageSize;

//   let search = {};
//   let projection = {};
//   const FilterLocations = (data) => {
//     console.log(data);
//     return data;
//   };
//   const sortTheHotelData = (data) => {
//     return data;
//   };
//   // const sortFilter = {};

//   if (location) {
//     search = { ...search, $text: { $search: location } };
//   }

//   // Longitude and Latitude
//   if (lat && lng) {
//     const hotelIds = await HotelModel.find({
//       location: {
//         $nearSphere: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(lat), parseFloat(lng)],
//           },
//           $maxDistance: parseInt(kmRadius) * 1000,
//         },
//       },
//     }).distinct("_id");
//     search = { ...search, _id: { $in: hotelIds } };
//   }

//   // Price Filter
//   if (priceMax && priceMin) {
//     if (roomType) {
//       search = {
//         ...search,
//         "rooms._id": roomType,
//         "rooms.price": { $gte: priceMin, $lte: priceMax },
//       };
//     } else {
//       search = {
//         ...search,
//         "rooms.price": { $gte: priceMin, $lte: priceMax },
//       };
//     }
//   }
//   // Hotel Type
//   if (hotelType) {
//     search = { ...search, hotelType: hotelType };
//   }

//   // amenites
//   if (amenities) {
//     const amenitiesArray = amenities.split(",");
//     const roomTypeIds = await RoomsTypeModel.find({
//       amenties: { $all: amenitiesArray },
//     }).distinct("_id");

//     if (roomTypeIds.length > 0) {
//       search = {
//         ...search,
//         "rooms.roomType": roomTypeIds,
//       };
//     } else {
//       search = {
//         ...search,
//         "rooms.roomType": [],
//       };
//     }
//   }

//   if (payment) {
//     search = { isPostpaidAllowed: payment === "payathotel" ? true : false };
//   }

//   try {
//     const totalCount = await HotelModel.count(search);
//     if (totalCount === 0)
//       return res
//         .status(204)
//         .json({ error: true, message: "Oops ! No Hotel Found" });
//     const response = await HotelModel.find(search, projection)
//       .select(fields)
//       .sort({ matchAddress: { $meta: "textScore" } });

//     // response filter
//     response.sort(sortTheHotelData);

//     if (!response)
//       return res
//         .status(400)
//         .json({ error: true, message: "No Hotels Found At this Location" });
//     res.status(200).json({ error: false, data: response });
//   } catch (error) {
//     res.status(500).json({ error: true, error: error.message });
//   }
// };

const GetSearchHotels = async (req, res) => {
  const {
    location,
    checkIn,
    checkOut,
    lat,
    lng,
    totalRooms,
    roomType,
    priceMin,
    priceMax,
    hotelType,
    amenities,
    payment,
    kmRadius,
    page,
    pageSize,
    sort,
    fields,
  } = req.query;
  try {
    const skip = (page - 1) * pageSize;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const amenitiesArray = amenities?.split(",");

    // Room Filter
    const roomFilter = (roomType) => {
      let result;
      if (!roomType) {
        result = 1;
      } else {
        result = {
          $filter: {
            input: "$rooms",
            as: "room",
            cond: {
              $eq: ["$$room.roomType", new mongoose.Types.ObjectId(roomType)],
            },
          },
        };
      }
      return result;
    };

    const hotelIds = await RoomsTypeModel.find({
      amenties: { $all: amenitiesArray },
    }).distinct("_id");

    const MatchCriteria = {
      $text: { $search: location },
    };

    const otherSearch = {
      $and: [
        MatchCriteria,
        hotelType ? { hotelType: new mongoose.Types.ObjectId(hotelType) } : {},
        priceMax && priceMin && roomType
          ? {
              "rooms.roomType": new mongoose.Types.ObjectId(roomType),
              "rooms.price": {
                $gte: parseInt(priceMin),
                $lte: parseInt(priceMax),
              },
            }
          : priceMax && priceMin
          ? {
              "rooms.price": {
                $gte: parseInt(priceMin),
                $lte: parseInt(priceMax),
              },
            }
          : {},
        payment
          ? { isPostpaidAllowed: payment === "payathotel" ? true : false }
          : {},
        hotelIds.length > 0
          ? {
              "rooms.roomType": { $in: hotelIds },
            }
          : {},
        lat && lng
          ? {
              "location.coordinates": {
                $geoWithin: {
                  $centerSphere: [
                    [parseFloat(lat), parseFloat(lng)], // Latitude and Longitude
                    80 / 6371, // Radius in kilometers converted to radians
                  ],
                },
              },
            }
          : {},
      ],
    };

    const Sorting = (sort) => {
      switch (sort) {
        case "popularity":
          return { score: { $meta: "textScore" } };
        case "ratings":
          return { hotelRatings: -1 };
        case "l2h":
          return {
            "rooms.price": 1,
          };
        case "h2l":
          return {
            "rooms.price": -1,
          };
        default:
          return {};
      }
    };

    const response = await HotelModel.aggregate([
      { $match: otherSearch },
      {
        $lookup: {
          from: "room-categories",
          localField: "rooms.roomType",
          foreignField: "_id",
          as: "roomsTypes",
        },
      },
      {
        $lookup: {
          from: "property-types",
          localField: "hotelType",
          foreignField: "_id",
          as: "hotelType",
        },
      },
      { $unwind: "$hotelType" },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 1,
                hotelName: 1,
                hotelEmail: 1,
                hotelCoverImg: 1,
                hotelType: 1,
                hotelMapLink: 1,
                locality: 1,
                city: 1,
                state: 1,
                hotelRatings: 1,
                rooms: {
                  $cond: {
                    if: { $ifNull: [roomType, false] },
                    then: {
                      $filter: {
                        input: "$rooms",
                        as: "room",
                        cond: {
                          $eq: [
                            "$$room.roomType",
                            new mongoose.Types.ObjectId(roomType),
                          ],
                        },
                      },
                    },
                    else: "$rooms",
                  },
                },
                amenties: {
                  $reduce: {
                    input: "$roomsTypes.amenties",
                    initialValue: [],
                    in: {
                      $concatArrays: ["$$value", "$$this"],
                    },
                  },
                },
                additionalAmenties: {
                  $reduce: {
                    input: "$rooms.additionAmenities",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                score: { $meta: "textScore" },
              },
            },
            { $sort: Sorting(sort) },
            { $skip: parseInt(skip) },
            { $limit: parseInt(pageSize) },
          ],
          pagination: [{ $count: "counts" }],
        },
      },
    ]);

    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "No Hotels Found At this Location" });
    res.status(200).json({ error: false, data: response });
  } catch (error) {
    res.status(500).json({ error: true, error: error.message });
  }
};

// const GetSearchedLocationData = async (req, res) => {
//   const { location, lat, lng, kmRadius, roomType, pageSize, page } = req.query;
//   const skip = (page - 1) * pageSize;
//   try {
//     const searchQuery = {
//       $and: [
//         location ? { $text: { $search: location } } : {}, // Text search on 'location'
//         {
//           "location.coordinates": {
//             $geoWithin: {
//               $centerSphere: [
//                 [parseFloat(lat), parseFloat(lng)], // Latitude and Longitude
//                 20 / 6371, // Radius in kilometers converted to radians
//               ],
//             },
//           },
//         },
//       ],
//     };
//     const data = await HotelModel.aggregate([
//       { $match: searchQuery },
//       {
//         $lookup: {
//           from: "room-categories",
//           localField: "rooms.roomType",
//           foreignField: "_id",
//           as: "roomsTypes",
//         },
//       },
//       {
//         $lookup: {
//           from: "property-types",
//           localField: "hotelType",
//           foreignField: "_id",
//           as: "hotelType",
//         },
//       },

//       { $unwind: "$hotelType" },
//       {
//         $facet: {
//           // First stage: Get the paginated data
//           data: [
//             {
//               $project: {
//                 _id: 1,
//                 hotelName: 1,
//                 hotelEmail: 1,
//                 hotelCoverImg: 1,
//                 hotelType: 1,
//                 hotelMapLink: 1,
//                 locality: 1,
//                 city: 1,
//                 state: 1,
//                 hotelRatings: 1,
//                 rooms: {
//                   $cond: {
//                     if: { $ifNull: [roomType, false] },
//                     then: {
//                       $filter: {
//                         input: "$rooms",
//                         as: "room",
//                         cond: {
//                           $eq: [
//                             "$$room.roomType",
//                             new mongoose.Types.ObjectId(roomType),
//                           ],
//                         },
//                       },
//                     },
//                     else: "$rooms",
//                   },
//                 },
//                 amenties: {
//                   $reduce: {
//                     input: "$roomsTypes.amenties",
//                     initialValue: [],
//                     in: {
//                       $concatArrays: ["$$value", "$$this"],
//                     },
//                   },
//                 },
//                 additionalAmenties: {
//                   $reduce: {
//                     input: "$rooms.additionAmenities",
//                     initialValue: [],
//                     in: { $concatArrays: ["$$value", "$$this"] },
//                   },
//                 },
//                 score: { $meta: "textScore" },
//               },
//             },
//             { $sort: { score: { $meta: "textScore" } } },
//             { $skip: parseInt(skip) },
//             { $limit: parseInt(pageSize) },
//           ],
//           pagination: [{ $count: "counts" }],
//         },
//       },
//     ]);
//     res.status(200).json({ error: false, message: "success", data: data });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };
const GetSearchedLocationData = async (req, res) => {
  const {
    endpoint,
    roomType,
    pageSize,
    page,
    sort,
    priceMin,
    priceMax,
    hotelType,
    amenities,
    checkIn,
    checkOut,
    payment,
    kmRadius,
  } = req.query;
  const skip = (page - 1) * pageSize;

  const amenitiesArray = amenities?.split(",");

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // // Room Filter
  // const roomFilter = (roomType) => {
  //   let result;
  //   if (!roomType) {
  //     result = 1;
  //   } else {
  //     result = {
  //       $filter: {
  //         input: "$rooms",
  //         as: "room",
  //         cond: {
  //           $eq: ["$$room.roomType", new mongoose.Types.ObjectId(roomType)],
  //         },
  //       },
  //     };
  //   }
  //   return result;
  // };

  const hotelIds = await RoomsTypeModel.find({
    amenties: { $all: amenitiesArray },
  }).distinct("_id");

  const { location, address } = await PopularLocations.findOne({
    endpoint: endpoint,
  });
  try {
    const Sorting = (sort) => {
      switch (sort) {
        case "popularity":
          return { score: { $meta: "textScore" } };
        case "ratings":
          return { hotelRatings: -1 };
        case "l2h":
          return {
            "rooms.price": 1,
          };
        case "h2l":
          return {
            "rooms.price": -1,
          };
        default:
          return {};
      }
    };

    const searchQuery = {
      $and: [
        location ? { $text: { $search: address } } : {}, // Text search on 'location'
        {
          "location.coordinates": {
            $geoWithin: {
              $centerSphere: [
                [
                  parseFloat(location.coordinates[1]),
                  parseFloat(location.coordinates[0]),
                ],
                80 / 6371,
              ],
            },
          },
        },
        hotelType ? { hotelType: new mongoose.Types.ObjectId(hotelType) } : {},
        priceMax && priceMin && roomType
          ? {
              "rooms.roomType": new mongoose.Types.ObjectId(roomType),
              "rooms.price": {
                $gte: parseInt(priceMin),
                $lte: parseInt(priceMax),
              },
            }
          : priceMax && priceMin
          ? {
              "rooms.price": {
                $gte: parseInt(priceMin),
                $lte: parseInt(priceMax),
              },
            }
          : {},
        payment ? { isPostpaidAllowed: payment } : {},
        hotelIds.length > 0
          ? {
              "rooms.roomType": { $in: hotelIds },
            }
          : {},
      ],
    };
    const data = await HotelModel.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: "room-categories",
          localField: "rooms.roomType",
          foreignField: "_id",
          as: "roomsTypes",
        },
      },
      {
        $lookup: {
          from: "property-types",
          localField: "hotelType",
          foreignField: "_id",
          as: "hotelType",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "bookings",
          foreignField: "_id",
          as: "hotelBookings",
        },
      },

      { $unwind: "$hotelType" },
      {
        $facet: {
          // First stage: Get the paginated data
          data: [
            {
              $project: {
                _id: 1,
                hotelName: 1,
                hotelEmail: 1,
                hotelCoverImg: 1,
                hotelType: 1,
                hotelMapLink: 1,
                locality: 1,
                city: 1,
                state: 1,
                hotelRatings: 1,
                rooms: {
                  $cond: {
                    if: { $ifNull: [roomType, false] },
                    then: {
                      $filter: {
                        input: "$rooms",
                        as: "room",
                        cond: {
                          $eq: [
                            "$$room.roomType",
                            new mongoose.Types.ObjectId(roomType),
                          ],
                        },
                      },
                    },
                    else: "$rooms",
                  },
                },
                amenties: {
                  $reduce: {
                    input: "$roomsTypes.amenties",
                    initialValue: [],
                    in: {
                      $concatArrays: ["$$value", "$$this"],
                    },
                  },
                },
                additionalAmenties: {
                  $reduce: {
                    input: "$rooms.additionAmenities",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                score: { $meta: "textScore" },
              },
            },
            { $sort: Sorting(sort) },
            { $skip: parseInt(skip) },
            { $limit: parseInt(pageSize) },
          ],
          pagination: [{ $count: "counts" }],
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { GetSearchHotels, GetSearchedLocationData };
