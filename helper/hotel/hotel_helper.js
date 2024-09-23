// give the hotel listing as per the role of the user
require("dotenv").config();
const { default: axios } = require("axios");
const AdminModel = require("../../Model/AdminModel/adminModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");

const HotelList = async (id, role) => {
  // Find the user by id
  let hotels;
  if (role.toLowerCase() === "vendor") {
    hotels = await HotelModel.find({ vendorId: id })
      .sort({ createdAt: -1 })
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
  } else if (role.toLowerCase() === "admin") {
    hotels = await HotelModel.find({})
      .sort({ createdAt: -1 })
      .populate("rooms.roomType")
      .exec();
  } else {
    hotels = null;
  }
  return hotels;
};

// find the role

const IsWho = async (id) => {
  const [isVendor, isAdmin] = await Promise.all([
    VendorModel.findById(id),
    AdminModel.findById(id),
  ]);

  const role = isVendor ? isVendor.role : isAdmin ? isAdmin.role : null;

  return role;
};

// delet the vendor hotel
const GetDeleteTheVendorHotel = async (id) => {
  // delete all the hotels of the vendor from the hotel table
  const vendor = await VendorModel.findById(id);
  try {
    const [isHotelDeleted, isVendorHotelListDeleted] = await Promise.all([
      HotelModel.deleteMany({ vendorId: id }),
      VendorModel.updateOne({ _id: id }, { $set: { hotels: [] } }),
    ]);
    if (!isHotelDeleted && !isVendorHotelListDeleted) return false;

    return true;
  } catch (error) {
    return false;
  }
};

const DeleteVendorSingleHotel = async (hid, vid) => {
  try {
    const vendor = await VendorModel.findOne({ _id: vid });

    if (!vendor) {
      return false; // Vendor not found
    }

    const updatedHotels = vendor.hotels.filter(
      (hotelId) => hotelId.toString() !== hid
    );

    const result = await VendorModel.updateOne(
      { _id: vid },
      { $set: { hotels: updatedHotels } }
    );
    const isHotelDeleted = await HotelModel.deleteOne({ _id: hid });

    if (result.nModified === 0 || isHotelDeleted.deletedCount === 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const GetAllRoomWiseAmenities = async (arrayToMatch) => {
  try {
    const allamenities = {};
    const allroomtype = await RoomsTypeModel.find({});

    // Populate the allamenities object with room types and their amenities
    allroomtype.forEach((element) => {
      allamenities[element._id] = element.amenties;
    });

    const keys = {};

    for (let element of arrayToMatch) {
      for (let key in allamenities) {
        if (allamenities[key].includes(element)) {
          if (!keys[element]) {
            keys[element] = [];
          }
          keys[element].push(key);
        }
      }
    }

    return { amenities: allamenities, keys: keys };
  } catch (error) {
    throw error; // Handle or log the error as needed
  }
};

const GetAllFacilitiesRoomWise = async () => {
  const allamenities = {};
  const allroomtype = await RoomsTypeModel.find({});
  allroomtype.forEach((element) => {
    allamenities[element._id] = element.includeFacilities;
  });

  return allamenities;
};

// Get all the Room availibility
const GetRoomAvaliable = async (checkIn, checkOut) => {
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      throw new Error("Invalid date format");
    }

    const bookings = await Booking.find({
      $or: [
        {
          "bookingDate.checkIn": { $gte: checkInDate, $lte: checkOutDate },
        },
        {
          "bookingDate.checkOut": { $gte: checkInDate, $lte: checkOutDate },
        },
      ],
    }).populate("hotel");
    if (bookings.length === 0) return null;
    const report = {};

    bookings.forEach((booking) => {
      const roomId = booking?.room;
      const numberOfRooms = booking?.numberOfRooms || 0;

      if (roomId in report) {
        report[roomId] += numberOfRooms;
      } else {
        report[roomId] = numberOfRooms;
      }
    });
    return report;
  } catch (error) {
    return error;
  }
};

// Get the place id and  generate the url link
// const GetTheGoogleSpecification = async (latitude, longitude, hotelName) => {
//   const GoogleApiKey = process.env.GOOGLEMAPAPIKEY;
//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GoogleApiKey}`
//     );
//     if (response.status === 200) {
//       const placeId = await response.data.results[0].place_id;
//       const mapUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
//       return {
//         palceId: response.data.results[0].place_id,
//         data: response.data,
//         mapUrl: mapUrl,
//       };
//     }
//   } catch (error) {
//     return error;
//   }
// };

// Get the place id and generate the URL link
const GetTheGoogleSpecification = async (latitude, longitude, hotelName) => {
  const GoogleApiKey = process.env.GOOGLEMAPAPIKEY;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GoogleApiKey}`
    );
    if (response.status === 200) {
      const placeId = response.data.results[0].place_id;
      // const mapUrl = `https://www.google.com/maps/place?q=place_id:${placeId}`;
      const mapUrl = `https://www.google.com/maps/place?q=place_id:${placeId}`;
      // https://maps.googleapis.com/maps/api/geocode/json?latlng=26.8337152,80.93696&key=AIzaSyD_kgE_S3Nwf1IAamPa6D6ZyyazleBTrhI
      // https://www.google.com/maps?q=26.8337152,80.93696

      return {
        placeId: placeId,
        data: response.data,
        mapUrl: mapUrl,
      };
    }
  } catch (error) {
    return error;
  }
};

function generateGoogleMapsURL(
  latitude,
  longitude,
  zoomLevel = 10,
  address = ""
) {
  const timestamp = Date.now();
  const iframeURL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${latitude}!2d${longitude}!3d${zoomLevel}!4s${encodeURIComponent(
    address
  )}!5e0!3m2!1sen!2sus!4v${timestamp}`;
  return {
    mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
    iframeURL: iframeURL,
  };
}

module.exports = {
  HotelList,
  IsWho,
  GetDeleteTheVendorHotel,
  DeleteVendorSingleHotel,
  GetAllRoomWiseAmenities,
  GetAllFacilitiesRoomWise,
  GetRoomAvaliable,
  GetTheGoogleSpecification,
  generateGoogleMapsURL,
};
