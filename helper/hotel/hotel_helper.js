
// give the hotel listing as per the role of the user 

const AdminModel = require("../../Model/AdminModel/adminModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel")

const HotelList = async (id) => {
    // find the user bu id 
    const [isVendor, isAdmin] = await Promise.all([
        VendorModel.findById(id), AdminModel.findById(id)
    ])

    let hotels;
    if (isVendor) {
        hotels = await HotelModel.find({ vendorId: id })
    } else if (isAdmin) {
        hotels = await HotelModel.find({})
    } else {
        hotels = null
    }
    return hotels
}




// find the role 

const IsWho = async (id) => {


    const [isVendor, isAdmin] = await Promise.all([
        VendorModel.findById(id), AdminModel.findById(id)
    ])

    const role = isVendor ? isVendor.role : isAdmin ? isAdmin.role : null

    return role
}


// delet the vendor hotel 
const GetDeleteTheVendorHotel = async (id) => {
    // delete all the hotels of the vendor from the hotel table 
    const vendor = await VendorModel.findById(id)
    try {
        const [isHotelDeleted, isVendorHotelListDeleted] = await Promise.all([
            HotelModel.deleteMany({ vendorId: id }), VendorModel.updateOne({ _id: id }, { $set: { hotels: [] } })
        ])
        if (!isHotelDeleted && !isVendorHotelListDeleted) return false

        return true
    } catch (error) {
        return false
    }
}


const DeleteVendorSingleHotel = async (hid, vid) => {
    try {
        const vendor = await VendorModel.findOne({ _id: vid });

        if (!vendor) {
            return false; // Vendor not found
        }

        const updatedHotels = vendor.hotels.filter(hotelId => hotelId.toString() !== hid);

        const result = await VendorModel.updateOne({ _id: vid }, { $set: { hotels: updatedHotels } });
        const isHotelDeleted = await HotelModel.deleteOne({ _id: hid });

        if (result.nModified === 0 || isHotelDeleted.deletedCount === 0) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}






module.exports = { HotelList, IsWho, GetDeleteTheVendorHotel, DeleteVendorSingleHotel }