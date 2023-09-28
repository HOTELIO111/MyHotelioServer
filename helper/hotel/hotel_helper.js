// give the hotel listing as per the role of the user

const AdminModel = require("../../Model/AdminModel/adminModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");

const HotelList = async (id, role) => {
  // Find the user by id
  let hotels;
  if (role.toLowerCase() === "vendor") {
    hotels = await HotelModel.find({ vendorId: id, isAddedBy: role })
      .populate({
        path: "rooms.roomType",
        populate: [
          { path: "amenties", select: "_id title" },
          { path: "includeFacilities", select: "_id title" },
        ],
      })
      .exec();
  } else if (role.toLowerCase() === "admin") {
    hotels = await HotelModel.find({}).populate("rooms.roomType").exec();
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

module.exports = {
  HotelList,
  IsWho,
  GetDeleteTheVendorHotel,
  DeleteVendorSingleHotel,
  GetAllRoomWiseAmenities,
  GetAllFacilitiesRoomWise,
};
