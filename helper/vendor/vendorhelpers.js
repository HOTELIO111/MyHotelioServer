const { EncryptPassword } = require("../../Controllers/Others/PasswordEncryption")
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




// update the password of the vendor 

const VendorPasswordUpdate = async (email, password) => {
    try {
        const isVendor = await VendorModel.findOne({ email: email })

        if (!isVendor) return { error: true, message: "No vendor found with this Email", status: 404 }

        // create the hashed pasword 
        const hashedPassword = EncryptPassword(password)
        
        // update the password 
        isVendor.password = hashedPassword.hashedPassword;
        isVendor.secretKey = hashedPassword.salt;
        isVendor.save()

        return { error: false, message: "success", status: 200 }

    } catch (error) {
        return { error: true, message: error.message, status: 500 }
    }
}


module.exports = { DeleteTheSingleVendor, DeleteAllVendor, VendorPasswordUpdate }