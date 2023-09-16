const KycModel = require("../../Model/HotelModel/kycModel");
const { createTheKycRequest, DeleteTheKycRequest, GetAllKyc, IsVerifiedActions } = require("../../helper/vendor/kycHelpers");



// register the kyc req 
const RegisterKyc = async (req, res) => {
    const { vendorId, name, email, aadharNo, panNo, aadharImg, panImg } = req.body;
    try {
        if (!vendorId && !name && !email && !aadharNo && !panNo && !aadharImg && !panImg) return res.status(401).json({ error: true, message: "Invalid Credential" })

        // check the already kyc request with this id is existed or not 
        const isExisted = await KycModel.findOne({ vendorId: vendorId })
        if (isExisted) return res.status(409).json({ error: true, message: "you already applied for the kyc" })
        const isRequested = await createTheKycRequest(req.body)
        if (!isRequested) return res.status(400).json({ error: true, message: "failed !try  again" })

        res.status(200).json({ error: false, message: "success", data: isRequested })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}




const deleteTheKycRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await DeleteTheKycRequest(id)
        if (!response) return res.status(404).json({ error: true, message: "try again" })

        res.status(200).json({ error: false, message: "success" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


const GetAllKycRequests = async (req, res) => {
    const { id } = req.query;
    try {
        const response = await GetAllKyc(id)
        if (response === (null || Error)) return res.status(404).json({ error: true, message: "No data found" })

        res.status(200).json({ error: false, data: response, message: "success" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// Make action on Kyc request  

const MakeActionKyc = async (req, res) => {
    const { id, action } = req.query;

    if (!["approved", "failed", "requested"].includes(action)) return res.status(401).json({ error: true, message: "invalid action type" })


    // if (action !== "approved") {
    //     if (kycReq.isVerified === "approved") return res.status(422).json({ error: true, message: "you already approved it so you cannot do cancel it" })
    // }


    try {
        if (!id && !action) return res.status({ error: true, message: "please check the credentials try again" })

        const response = await IsVerifiedActions(id, action)

        if (!response) return res.status(404).json({ error: true, message: "Kyc Request not found" })

        res.status(200).json({ error: false, message: "success", data: response })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }

}





module.exports = { RegisterKyc, deleteTheKycRequest, GetAllKycRequests, MakeActionKyc }