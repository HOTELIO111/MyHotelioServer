const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const {
  GetAllRoomWiseAmenities,
  GetRoomAvaliable,
} = require("../../helper/hotel/hotel_helper");
const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");
const Booking = require("../../Model/booking/bookingModel");

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
        lat && lng && kmRadius
          ? {
              _id: {
                $in: await HotelModel.find({
                  location: {
                    $nearSphere: {
                      $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lat), parseFloat(lng)],
                      },
                      $maxDistance: parseInt(kmRadius) * 1000,
                    },
                  },
                }).distinct("_id"),
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

    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "No Hotels Found At this Location" });
    res.status(200).json({ error: false, data: response });
  } catch (error) {
    res.status(500).json({ error: true, error: error.message });
  }
};

module.exports = { GetSearchHotels };

// if (checkIn && checkOut) {
//   const checkInDate = new Date(checkIn);
//   const checkOutDate = new Date(checkOut);
//   const isAvailable = await Booking.aggregate([
//     {
//       $match: {
//         bookingStatus: "confirmed",
//         $or: [
//           {
//             "bookingDate.checkIn": { $lt: checkOutDate },
//             "bookingDate.checkOut": { $gt: checkInDate },
//           },
//         ],
//       },
//     },
//     {
//       $group: {
//         _id: "$hotel",
//         totalBookedRooms: { $sum: "$numberOfRooms" },
//       },
//     },
//   ]);
//   console.log(isAvailable);
// const total = isAvailable.reduce(
//   (accumulator, currentValue) => accumulator + currentValue.numberOfRooms,
//   0
// );

// search = { "rooms.counts": { $gte: parseInt(total + totalRooms) } };
// }

// if (lat && lng)
// textSearch = {
//     ...search,
//     location: {
//       $nearSphere: {
//         $geometry: {
//           type: "Point",
//           coordinates: [parseFloat(lat), parseFloat(lng)],
//         },
//         $maxDistance: parseInt(kmRadius) * 1000,
//       },
//     },
//   };

// if (roomType) {
//   const roomArray = roomType.split(",").map((item) => item.trim());
//   search = { "rooms.roomType": { $in: roomArray } };
// }

// if (hotelType) {
//   search = { hotelType: hotelType };
// }

// if (priceMax && priceMin) {
//   if (roomType) {
//     search = {
//       "rooms.roomType": roomType,
//       "rooms.price": {
//         $lte: parseInt(priceMax),
//         $gte: parseInt(priceMin),
//       },
//     };
//   } else {
//     search = {
//       "rooms.price": {
//         $lte: parseInt(priceMax),
//         $gte: parseInt(priceMin),
//       },
//     };
//   }
// }

// if (amenities) {
//   const amenitiesArray = amenities.split(",").map((item) => item.trim());
//   const roomTypeData = await RoomsTypeModel.find({
//     amenities: amenitiesArray,
//   });

//   console.log(roomTypeData);

//   // if (roomTypeData) {
//   //   search = { "rooms.roomType": roomTypeData[0]._id };
//   // } else {
//   //   console.log("not working ");
//   // }
// }

// location split =

// const newLocation = location.split(",");
// const locationRegexPatter = new RegExp(
//   newLocation.map((key) => `\\b${key}\\b`).join("|"),
//   "i"
// );

// with longitude and latitude
//   if (lat && lng) {
//     search = {
//       location: {
//         $nearSphere: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(lat), parseFloat(lng)],
//           },
//           $maxDistance: parseInt(kmRadius) * 1000,
//         },
//       },
//     };
//   } else
//     return res
//       .status(404)
//       .json({ error: true, message: "missing location credentials " });

//   if (hotelType) {
//     // category
//     const hotelTypeArray = hotelType.split(",").map((item) => item.trim());
//     search.hotelType = { $in: hotelTypeArray };
//   }

//   // Roomtype filter
//   if (roomType) {
//     const roomArray = roomType.split(",").map((item) => item.trim());
//     search["rooms.roomType"] = { $in: roomArray };
//   }

//   // price
//   if (priceMin && priceMax) {
//     search["rooms.price"] = {
//       $lte: parseInt(priceMax),
//       $gte: parseInt(priceMin),
//     };
//   }
//   // amaenities
//   if (amenities) {
//     const amenitiesArray = amenities.split(",").map((item) => item.trim());
//     const allAmenities = await GetAllRoomWiseAmenities(amenitiesArray);
//     const enumValues = Object.values(allAmenities.keys);
//     search["rooms.roomType"] = { $in: enumValues[0] };
//   }

//   // Check-in and checkout
//   if (checkIn && checkOut) {
//     const isRoom = await GetRoomAvaliable(checkIn, checkOut);
//     if (isRoom !== null) {
//       const roombookedId = Object.keys(isRoom);
//       if (roombookedId.includes(search["rooms._id"])) {
//         search["rooms.counts"] = {
//           $gte: isRoom[search["rooms._id"]] + totalRooms,
//         };
//       } else {
//         search["rooms.counts"] = { $gte: parseInt(totalRooms) };
//       }
//     }
//   }

//   // Some sortBy
//   if (sort) {
//     switch (sort) {
//       case "popularity":
//         sortFilter["hotelRating"] = -1;
//         break;
//       case "ratings":
//         sortFilter["hotelRating"] = -1;
//         break;
//       case "l2h":
//         sortFilter["rooms.price"] = 1; // Sort rooms by price in ascending order
//         break;
//       case "h2l":
//         sortFilter["rooms.price"] = -1;
//         break;
//       default:
//         break;
//     }
//   }
