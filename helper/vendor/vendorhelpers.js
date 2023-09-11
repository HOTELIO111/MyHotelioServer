const HotelModel = require("../../Model/HotelModel/hotelModel")
const VendorModel = require("../../Model/HotelModel/vendorModel")



const DeleteTheSingleVendor = async (id) => {
    try {
        const [vendorDeleted, HotelsDeleted] = await Promise.all([
            VendorModel.findByIdAndDelete(id), HotelModel.deleteMany({ vendorId: id })
        ])

        if (!vendorDeleted && !HotelsDeleted) return false

        return true
    } catch (error) {
        return false
    }

}



const DeleteAllVendor = async () => {
    try {
        const [allvendorDeleted, allHotelsDeleted] = await Promise.all([
            VendorModel.deleteMany({}), HotelModel.deleteMany({ isAddedBy: "vendor" })
        ])

        if (!allvendorDeleted && !allHotelsDeleted) return false

        return true
    } catch (error) {
        return false
    }
}


module.exports = { DeleteTheSingleVendor, DeleteAllVendor }