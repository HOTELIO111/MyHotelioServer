const { default: axios } = require("axios");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
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

const RegisterHotel = async (req, res) => {
  const vendorId = req.params.id;

  const _is = await IsWho(vendorId);
  if (_is === null)
    return res
      .status(401)
      .json({ error: true, message: "Invalid Hotel Partner Id " });

  // generate Map rl
  const { mapUrl, iframeURL } = await generateGoogleMapsURL(
    req.body.location.coordinates[0],
    req.body.location.coordinates[1],
    100,
    req.body.address
  );

  // Register the hotel
  const response = await new HotelModel({
    ...req.body,
    vendorId: _is === "vendor" ? vendorId : null,
    isAddedBy: _is,
    hotelMapLink: iframeURL,
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
    { _id: vendorId },
    { $push: { hotels: response._id } },
    { new: true, upsert: true }
  );
  if (!Vendor) {
    // If the ID is not pushed into the customer's data, consider the hotel as unregistered
    await response.remove();
    return res
      .status(400)
      .json({ error: true, message: "Hotel Not Registered. Try Again" });
  }

  res.status(200).json({ error: false, data: response });
};

// Get all the data
const GetAllHotel = async (req, res) => {
  try {
    const AllData = await HotelModel.find({});
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

// Update the Hotel Data
const UpdateHotelData = async (req, res) => {
  const id = req.params.id;

  try {
    const isUser = await HotelModel.findById(id);
    if (!isUser)
      return res.status(404).json({ error: true, message: "No Data Found" });
    // Find the hotel
    const isFoundandUpdated = await HotelModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
        hotelEmail: isUser.hotelEmail,
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
    facilities,
    payment,
    kmRadius,
    page,
    pageSize,
  } = req.query;
  const skip = (page - 1) * pageSize;

  const search = {};
  const pipeLine = [];

  // with longitude and latitude
  if (lat && lng) {
    search.location = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lat), parseFloat(lng)],
        },
        $maxDistance: parseInt(kmRadius) * 1000, // Convert to meters
      },
    };
  }

  if (location) {
    console.log(location);
    search.city = { $regex: location, $options: "i" };
  }
  // category
  if (hotelType) {
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

    // Create an array to store the values from allAmenities
    const enumValues = Object.values(allAmenities.keys);

    // Create a query to check if "rooms.roomType" is in any of the enumValues arrays
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

  try {
    const response = await HotelModel.find(search).populate([
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
    ]);

    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "No Hotels Found At this Location" });

    res.status(200).json({ error: false, data: response });
  } catch (error) {
    res.status(500).json({ error: true, error });
  }
};

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

// Delete the single Vendor
const pagination = async (req, res) => {
  try {
    const items = await HotelModel.find().skip(skip).limit(Number(pageSize));
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

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

// const MapAPi = async (req, res) => {
//   const { key, place_id } = req.query;
//   console.log(key, place_id);

//   try {
//     const response = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/details/json",
//       {
//         params: {
//           place_id: place_id,
//           key: key,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred", message: error.message });
//   }
// };

// const MapAPi = async (req, res) => {
//   const { key, place_id, query } = req.query;
//   console.log(key, place_id);

//   try {
//     // const response = await axios.get(
//     //   "https://maps.googleapis.com/maps/api/place/details/json",
//     //   {
//     //     params: {
//     //       place_id: place_id,
//     //       key: key,
//     //     },
//     //   }
//     // );
//     const response = await axios.get(
//       "https://maps.googleapis.com/maps/api/place/details/json",
//       {
//         params: {
//           place_id: place_id,
//           key: key,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred", message: error.message });
//   }
// };

const MapAPi = async (req, res) => {
  const { lng, ltd } = req.query;
  try {
    const response = await GetTheGoogleSpecification(ltd, lng);
    res.json(response);
  } catch (error) {
    res.json(error);
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
  pagination,
  DeleteSelectedVendorHotel,
  DeleteSigleHotel,
  DeleteAllHotel,
  GetCheckInCheckOut,
  MapAPi,
};
