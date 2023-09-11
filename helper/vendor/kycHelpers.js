const KycModel = require("../../Model/HotelModel/kycModel")

const createTheKycRequest = async (formdata) => {
    try {
        const response = await new KycModel({
            isVerified: "approved",
            ...formdata
        }).save()
        if (!response) return false

        return response
    } catch (error) {
        return false
    }
}



const DeleteTheKycRequest = async (id) => {
    try {
        const response = await KycModel.findByIdAndDelete(id)
        if (!response) return false
        return true
    } catch (error) {
        return false
    }
}


module.exports = { createTheKycRequest, DeleteTheKycRequest }