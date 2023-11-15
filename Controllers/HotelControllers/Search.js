const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const {
  GetAllRoomWiseAmenities,
  GetRoomAvaliable,
} = require("../../helper/hotel/hotel_helper");
const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");

const GetSearchHotels = async (req, res) => {
  const {
    // location,
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
    facilities,
    payment,
    kmRadius,
    page,
    pageSize,
    sort,
    fields,
  } = req.query;
  const skip = (page - 1) * pageSize;

  let search = {};
  const sortFilter = {};

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

  if (lng && lat) {
    search = {
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lat), parseFloat(lng)],
          },
          $maxDistance: parseInt(kmRadius) * 1000,
        },
      },
    };
  }

  if (roomType) {
    const roomArray = roomType.split(",").map((item) => item.trim());
    search = { "rooms.roomType": { $in: roomArray } };
  }

  if (hotelType) {
    search = { hotelType: hotelType };
  }

  if (priceMax && priceMin) {
    if (roomType) {
      search = {
        "rooms.roomType": roomType,
        "rooms.price": {
          $lte: parseInt(priceMax),
          $gte: parseInt(priceMin),
        },
      };
    } else {
      search = {
        "rooms.price": {
          $lte: parseInt(priceMax),
          $gte: parseInt(priceMin),
        },
      };
    }
  }

  if (amenities) {
    const amenitiesArray = amenities.split(",").map((item) => item.trim());
    const roomTypeData = await RoomsTypeModel.find({
      amenities: amenitiesArray,
    });

    console.log(roomTypeData);

    // if (roomTypeData) {
    //   search = { "rooms.roomType": roomTypeData[0]._id };
    // } else {
    //   console.log("not working ");
    // }
  }
  try {
    const totalCount = await HotelModel.count(search);

    const response = await HotelModel.find(search).select(fields);

    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "No Hotels Found At this Location" });
    res
      .status(200)
      .json({ error: false, data: response, totalCount: totalCount });
  } catch (error) {
    res.status(500).json({ error: true, error: error.message });
  }
};

module.exports = { GetSearchHotels };
