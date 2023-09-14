const KycModel = require("../../Model/HotelModel/kycModel")
const VendorModel = require("../../Model/HotelModel/vendorModel")

const createTheKycRequest = async (formdata) => {
    try {
        const response = await new KycModel({
            isVerified: "requested",
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


const GetAllKyc = async (id) => {
    if (id) {
        const user = await KycModel.find({ vendorId: id })
        return user
    }
    try {
        const allKyc = await KycModel.find({}).sort({ createdAt: -1 })
        const approved = []
        const failed = []
        const requested = []
        const all = [...allKyc]

        allKyc?.forEach(element => {
            if (element.isVerified === "approved") {
                approved.push(element)
            } else if (element.isVerified === "failed") {
                failed.push(element)
            } else if (element.isVerified === "requested") {
                requested.push(element)
            } else {
                return null
            }
        });
        return data = { approved, failed, requested, all }
    } catch (error) {
        return Error
    }
}


// make action on isVerified

const IsVerifiedActions = async (id, action, previousAction) => {
    try {

        const updatedKyc = await KycModel.findByIdAndUpdate(id, { isVerified: action }, { new: true });

        if (action === "approved") {
            await VendorModel.findByIdAndUpdate(updatedKyc.vendorId, { kycVerified: true }, { new: true });
        }
        if (action === "failed") {
            await VendorModel.findByIdAndUpdate(updatedKyc.vendorId, { kycVerified: false }, { new: true })
        }
        return updatedKyc;
    } catch (error) {
        // Handle errors here
        console.error("Error in IsVerifiedActions:", error);
        throw error;
    }
};



module.exports = { createTheKycRequest, DeleteTheKycRequest, GetAllKyc, IsVerifiedActions }