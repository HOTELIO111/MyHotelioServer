const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");
const { defaultDetails } = require("../../Model/other/DefaultText");
const {
  HotelList,
  GetDeleteTheVendorHotel,
  DeleteVendorSingleHotel,
  IsWho,
  GetAllRoomWiseAmenities,
  GetRoomAvaliable,
  GetTheGoogleSpecification,
  generateGoogleMapsURL,
} = require("../../helper/hotel/hotel_helper");

// const RegisterHotel = async (req, res) => {
//   const vendorId = req.params.id;

//   const _is = await IsWho(vendorId);
//   if (_is === null)
//     return res
//       .status(401)
//       .json({ error: true, message: "Invalid Hotel Partner Id " });

//   try {
//     // Register the hotel
//     const response = await new HotelModel({
//       ...req.body,
//       vendorId: _is === "vendor" ? vendorId : null,
//       isAddedBy: _is,
//     }).save();
//     response.discription = defaultDetails(
//       response.hotelName,
//       `${response.city} ${response.state}`
//     );
//     response.save();
//     if (!response) {
//       return res
//         .status(400)
//         .json({ error: true, message: "Hotel Not Added Please try Again" });
//     }

//     // Find the user and update this hotel id
//     const Vendor = await VendorModel.findOneAndUpdate(
//       { _id: vendorId },
//       { $push: { hotels: response._id } },
//       { new: true, upsert: true }
//     );
//     if (!Vendor) {
//       // If the ID is not pushed into the customer's data, consider the hotel as unregistered
//       await response.remove();
//       return res
//         .status(400)
//         .json({ error: true, message: "Hotel Not Registered. Try Again" });
//     }

//     res.status(200).json({ error: false, data: response });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };
const RegisterHotel = async (req, res) => {
  try {
    // Register the hotel
    const response = await new HotelModel({
      ...req.body,
    }).save();
    response.discription = defaultDetails(
      response.hotelName,
      `${response.city} ${response.state}`
    );
    response.save();
    if (!response) {
      return res
        .status(400)
        .json({ error: true, message: "Hotel Not Added Please try Again" });
    }

    // Find the user and update this hotel id
    const Vendor = await VendorModel.findOneAndUpdate(
      { _id: response.vendorId },
      { $push: { hotels: response._id } },
      { new: true, upsert: true }
    );
    if (!Vendor) {
      await response.remove();
      return res
        .status(400)
        .json({ error: true, message: "Hotel Not Registered. Try Again" });
    }

    res.status(200).json({ error: false, data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all the data
const GetAllHotel = async (req, res) => {
  const { limit, page, fields } = req.query;
  const skip = limit * page;
  try {
    const AllData = await HotelModel.find({})
      .select(fields)
      .skip(skip)
      .limit(limit);
    if (!AllData)
      return res.status(400).json({ error: true, message: "No Data Found" });
    res.status(200).json({ error: true, data: AllData });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const GetSingleHotel = async (req, res) => {
  const Id = req.params.id;
  try {
    // check the hotel with id
    const isHotel = await HotelModel.findById(Id)
      .populate([
        {
          path: "rooms.roomType",
          populate: [
            { path: "amenties", select: "_id title" },
            { path: "includeFacilities", select: "_id title" },
          ],
        },
        { path: "hotelType", select: "_id title" },
        { path: "bookings" },
        { path: "vendorId" },
      ])
      .exec();

    if (!isHotel)
      return res.status(404).json({ error: true, message: "No Data Found" });
    // return the response
    res.status(200).json({ error: false, data: isHotel });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const GetSingleHotelDataNew = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, totalRooms } = req.query;
  try {
    const _hotel = await HotelModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
                      { from: { $gte: new Date(checkIn) } },
                      { from: { $lte: new Date(checkOut) } },
                    ],
                  },
                  {
                    $and: [
                      { to: { $gte: new Date(checkIn) } },
                      { to: { $lte: new Date(checkOut) } },
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
        $lookup: {
          from: "bookings",
          foreignField: "_id",
          localField: "bookings",
          pipeline: [
            {
              $match: {
                bookingStatus: "confirmed",
                $or: [
                  {
                    "bookingDate.checkIn": {
                      $gte: new Date(checkIn),
                      $lte: new Date(checkOut),
                    },
                  },
                  {
                    "bookingDate.checkOut": {
                      $gte: new Date(checkIn),
                      $lte: new Date(checkOut),
                    },
                  },
                  {
                    $and: [
                      { "bookingDate.checkIn": { $lte: new Date(checkIn) } },
                      { "bookingDate.checkOut": { $gte: new Date(checkOut) } },
                    ],
                  },
                ],
              },
            },
            {
              $group: {
                _id: "$room",
                bookedRoom: { $first: "$room" },
                totalRooms: { $sum: "$numberOfRooms" },
              },
            },
            {
              $project: {
                _id: 1,
                bookedRoom: 1,
                totalRooms: 1,
              },
            },
          ],

          as: "bookingDatas",
        },
      },
      {
        $project: {
          _id: 1,
          vendorId: { $arrayElemAt: ["$vendorData", 0] },
          isAddedBy: 1,
          hotelName: 1,
          hotelType: { $arrayElemAt: ["$PropertyType", 0] },
          hotelEmail: 1,
          hotelMobileNo: 1,
          locality: 1,
          address: 1,
          city: 1,
          state: 1,
          country: 1,
          zipCode: 1,
          location: 1,
          rooms: {
            $map: {
              input: "$rooms",
              as: "room",
              in: {
                bookingCount: "$bookingDatas",
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
                                    { $eq: ["$$roomCo.roomid", "$$room._id"] },
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
                                    { $eq: ["$$roomCo.roomid", "$$room._id"] },
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
                        cond: { $eq: ["$$roomTypes._id", "$$room.roomType"] },
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
          hotelImages: 1,
          checkOut: 1,
          checkIn: 1,
          cancellationPrice: 1,
          termsAndCondition: 1,
          hotelFullySanitized: 1,
          notSupportDiscrimination: 1,
          validAndTrueData: 1,
          hotelMapLink: 1,
          isAdminApproved: 1,
          isPostpaidAllowed: 1,
          status: 1,
          hotelRatings: 1,
          reviews: 1,
          createdAt: 1,
          discription: 1,
          book: "$bookingDatas",
        },
      },
    ]);

    res.status(200).json({ error: false, message: "success", data: _hotel });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update the Hotel Data
const UpdateHotelData = async (req, res) => {
  const id = req.params.id;

  try {
    const isUser = await HotelModel.find({ _id: id });
    if (!isUser)
      return res.status(404).json({ error: true, message: "No Data Found" });
    // Find the hotel
    const isFoundandUpdated = await HotelModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
        hotelEmail: isUser[0].hotelEmail,
      },
      { new: true }
    );
    if (!isFoundandUpdated)
      return res.status(400).json({ error: true, message: "No Updated" });

    res.status(200).json({
      error: false,
      data: isFoundandUpdated,
      message: "Updated Successfully ",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const DeleteSingleHotel = async (req, res) => {
  // id of the user to delete
  const id = req.params.id;

  try {
    // Find the hotel by ID
    const isHotel = await HotelModel.findById(id);

    // Check if the hotel exists
    if (!isHotel) {
      return res.status(404).json({ error: true, message: "Hotel not found" });
    }

    // Delete the hotel data from the Vendor Data
    const deleteVendorHotel = await VendorModel.updateOne(
      { _id: isHotel.vendorId },
      { $pull: { hotels: { _id: isHotel._id } } }
    );
    if (!deleteVendorHotel)
      return res
        .status(400)
        .json({ error: true, message: "no deleted try again" });

    // Remove the hotel document
    const deleteHotel = await HotelModel.findByIdAndDelete(id);
    if (!deleteHotel)
      return res
        .status(400)
        .json({ error: true, message: "hotel deletion faild ! try again" });

    res.status(200).json({ error: false, message: "Deleted successfully" });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

// delete all hotel of the single vendor
const DeleteSelectedVendorHotel = async (req, res) => {
  const { id } = req.params;

  const result = await GetDeleteTheVendorHotel(id);
  if (!result)
    return res
      .status(400)
      .json({ error: true, message: "deleted successfully" });

  res.status(200).json({ error: false, message: "success", data: result });
};

// delete vendor single hotel
const DeleteSigleHotel = async (req, res) => {
  const { hotelId } = req.query;

  try {
    // find the hotel data
    const isHotel = await HotelModel.findById(hotelId);
    if (!isHotel)
      return res.status(404).json({ error: true, message: "no hotel found" });

    // delete the hotel
    const isDeleted = await DeleteVendorSingleHotel(hotelId, isHotel.vendorId);
    if (!isDeleted)
      return res
        .status(400)
        .json({ error: true, message: "failed to deleted ! try again " });

    res.status(200).json({ error: false, message: "success deleted " });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delet all the dat
const DeleteAllHotelData = async (req, res) => {
  // find the data and delete the data
  HotelModel.deleteMany({})
    .then(() => {
      res.status(200).json({ error: false, message: "Deleted Successfully" });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

// Search Api for Hotel or location Search
const ReqHotelData = async (req, res) => {
  const { searchLocation } = req.query;
  // hotel data
  const requested = req.params.data.split(",");
  try {
    // Get all the data from the API
    const allData = await HotelModel.find({}).select(requested);
    let modifiedData;
    if (searchLocation === true) {
      // Concatenate the fields and create a new field called "concatenatedData"
      modifiedData = allData.map((data) => ({
        ...data._doc,
        concatenatedData: `${data.hotelName} , ${data.hotelAddress}`,
      }));
    } else {
      modifiedData = allData;
    }

    res.status(200).json({ error: false, data: modifiedData });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const FilterTheHotelData = async (req, res) => {
  // filter parameter we get
  const { location, roomType, checkIn, CheckOut, rooms, price } = req.query;

  // make the filter
  const filter = {};

  if (location) {
    filter.hotelAddress = { $regex: location, $options: "i" };
  }
  if (checkIn && CheckOut) {
    filter.$and = [
      { checkInTime: { $gte: new Date(checkIn), $options: "i" } },
      { checkOutTime: { $lte: new Date(CheckOut), $options: "i" } },
    ];
  }
  // get the data by filter
  try {
    const result = await HotelModel.find(filter);
    if (!result) return res.status(404).json({ message: "No date found" });

    res.status(200).json({ error: false, data: result });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const GetUsersHotel = async (req, res) => {
  const Id = req.params.id;
  const { role } = req.query;
  if (!Id && !role)
    return res
      .status(401)
      .json({ error: true, message: "missing credentials " });
  try {
    // get the hotels  as per id
    const allHotels = await HotelList(Id, role);
    if (allHotels === null)
      return res.status(400).json({ error: true, message: "no hotels found" });

    res.status(200).json({ error: false, data: allHotels });
  } catch (error) {
    res.status(500).json(error);
  }
};

const fitlerDataCreate = async (req, res) => {
  const { city, roomType, amenities, accomodationType } = req.query;
  const filter = {};

  // check the user is Verified or not

  // Filter with city
  if (city) {
    filter.city = { $regex: new RegExp(city, "i") };
  }

  // find the ammenities
  if (amenities) {
    const arrayAmenities = amenities.split(",").map((item) => item.trim());
    filter.amenities = { $all: arrayAmenities };
  }

  // accomodation type
  if (accomodationType) {
    const accomodationArray = accomodationType
      .split(",")
      .map((item) => item.trim());
    filter.hotelType = { $in: accomodationArray };
  }

  try {
    const result = await HotelModel.find(filter);
    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.status(200).json({ error: false, data: result });
  } catch (error) {
    console.error("Error while filtering data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const GetSearchTheHotelList = async (req, res) => {
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
  if (lat && lng) {
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
  } else
    return res
      .status(404)
      .json({ error: true, message: "missing location credentials " });

  if (hotelType) {
    // category
    const hotelTypeArray = hotelType.split(",").map((item) => item.trim());
    search.hotelType = { $in: hotelTypeArray };
  }

  // Roomtype filter
  if (roomType) {
    const roomArray = roomType.split(",").map((item) => item.trim());
    search["rooms.roomType"] = { $in: roomArray };
  }

  // price
  if (priceMin && priceMax) {
    search["rooms.price"] = {
      $lte: parseInt(priceMax),
      $gte: parseInt(priceMin),
    };
  }
  // amaenities
  if (amenities) {
    const amenitiesArray = amenities.split(",").map((item) => item.trim());
    const allAmenities = await GetAllRoomWiseAmenities(amenitiesArray);
    const enumValues = Object.values(allAmenities.keys);
    search["rooms.roomType"] = { $in: enumValues[0] };
  }

  // Check-in and checkout
  if (checkIn && checkOut) {
    const isRoom = await GetRoomAvaliable(checkIn, checkOut);
    if (isRoom !== null) {
      const roombookedId = Object.keys(isRoom);
      if (roombookedId.includes(search["rooms._id"])) {
        search["rooms.counts"] = {
          $gte: isRoom[search["rooms._id"]] + totalRooms,
        };
      } else {
        search["rooms.counts"] = { $gte: parseInt(totalRooms) };
      }
    }
  }

  // Some sortBy
  if (sort) {
    switch (sort) {
      case "popularity":
        sortFilter["hotelRating"] = -1;
        break;
      case "ratings":
        sortFilter["hotelRating"] = -1;
        break;
      case "l2h":
        sortFilter["rooms.price"] = 1; // Sort rooms by price in ascending order
        break;
      case "h2l":
        sortFilter["rooms.price"] = -1;
        break;
      default:
        break;
    }
  }

  try {
    const totalCount = await HotelModel.count(search);

    const response = await HotelModel.find(search)
      .select(
        "_id hotelName  hotelType locality address rooms hotelCoverImg  checkOut checkIn hotelRatings isPostpaidAllowed"
      )
      .populate([
        {
          path: "rooms.roomType",
          populate: [
            { path: "amenties", select: "title" },
            { path: "includeFacilities", select: "title" },
          ],
        },
        { path: "hotelType", select: "title" },
      ])
      .sort(sortFilter)
      .skip(skip)
      .limit(pageSize);

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

// Get Searcch Hotel by aggregate

// get list of the field
const GetFieldList = async (req, res) => {
  const { field } = req.params;

  try {
    const result = await HotelModel.distinct(field);
    if (!result)
      return res.status(404).json({ error: true, message: "Invalid Request" });

    // Make the data not repeatable (remove duplicates and format each word's first letter to uppercase)
    const uniqueValues = [
      ...new Set(result.map((item) => capitalizeFirstLetter(item))),
    ];

    res.status(200).json({ error: false, data: uniqueValues });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Function to capitalize the first letter of each word and make the rest lowercase
function capitalizeFirstLetter(str) {
  return str.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

// delete all hoteles and also the data from the vendor hotels data
const DeleteAllHotel = async (req, res) => {
  try {
    const AllHotelIdAndVendorIdList = await HotelModel.find(
      {},
      { _id: 1, vendorId: 1 }
    );
    if (!AllHotelIdAndVendorIdList || AllHotelIdAndVendorIdList.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "No hotels data found" });
    }

    // Use Promise.all to await all the delete operations
    const deletePromises = AllHotelIdAndVendorIdList.map(async (element) => {
      const [hotelDeleted, vendorHotelRemoved] = await Promise.all([
        HotelModel.deleteOne({ _id: element._id }),
        VendorModel.findByIdAndUpdate(element.vendorId, {
          $pull: { hotels: element._id },
        }),
      ]);
      if (!hotelDeleted || !vendorHotelRemoved) {
        throw new Error("Failed to delete hotel or remove from vendor");
      }
    });

    // Wait for all the delete operations to complete
    await Promise.all(deletePromises);

    res.status(200).json({ error: false, message: "Success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ------Room Api's ----------------------------------------------------

// Testing purposeFunction
const GetCheckInCheckOut = async (req, res) => {
  const Vendors = await VendorModel.updateMany({ hotels: [] });
  res.json(Vendors);
};

const MapAPi = async (req, res) => {
  const { lng, ltd } = req.query;
  try {
    const response = await GetTheGoogleSpecification(ltd, lng);
    res.json(response);
  } catch (error) {
    res.json(error);
  }
};

const GetSearch = async (req, res) => {
  const {
    lat,
    lng,
    kmRadius,
    checkIn,
    checkOut,
    totalRooms,
    roomType,
    priceMin,
    priceMax,
    hotelType,
    amenities,
    facilities,
    payment,
    page,
    pageSize,
    sort,
  } = req.query;
  try {
    // let search = {};
    // let projection = {}; // Change from const to let

    // if (lat && lng && kmRadius) {
    //   search = {
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
    // }

    // if (checkIn && checkOut) {
    //   const checkInDate = new Date(checkIn);
    //   const checkOutDate = new Date(checkOut);
    // }
    const response = await HotelModel.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "hotel._id",
          as: "bookingsData",
        },
        $match: {},
      },
    ]);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  RegisterHotel,
  GetAllHotel,
  GetSingleHotel,
  UpdateHotelData,
  DeleteSingleHotel,
  DeleteAllHotelData,
  FilterTheHotelData,
  ReqHotelData,
  GetUsersHotel,
  fitlerDataCreate,
  GetSearchTheHotelList,
  GetFieldList,
  GetSearch,
  DeleteSelectedVendorHotel,
  DeleteSigleHotel,
  DeleteAllHotel,
  GetCheckInCheckOut,
  MapAPi,
  GetSingleHotelDataNew,
};
