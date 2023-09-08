
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



// find the roles

const IsWho = async (id) => {


    const [isVendor, isAdmin] = await Promise.all([
        VendorModel.findById(id), AdminModel.findById(id)
    ])

    const role = isVendor ? isVendor.role : isAdmin ? isAdmin.role : null

    return role
}






module.exports = { HotelList, IsWho }