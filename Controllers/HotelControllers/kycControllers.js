const KycModel = require("../../Model/HotelModel/kycModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const { createTheKycRequest, DeleteTheKycRequest, GetAllKyc, IsVerifiedActions } = require("../../helper/vendor/kycHelpers");



// register the kyc req 
const RegisterKyc = async (req, res) => {
    try {
        // Request validation
        const { vendorId, name, email, aadharNo, panNo, aadharImg, panImg } = req.body;
        if (!vendorId || !name || !email || !aadharNo || !panNo || !aadharImg || !panImg) {
            return res.status(400).json({ error: true, message: "Invalid request data" });
        }
        // Find the vendor
        const vendor = await VendorModel.findOne({ _id: vendorId, name, email });

        if (!vendor) {
            return res.status(404).json({ error: true, message: "Vendor not found" });
        }

        // Check if a KYC request with this vendorId exists
        const existingKycRequest = await KycModel.findOne({ vendorId: vendorId });

        if (existingKycRequest) {
            if (existingKycRequest.isVerified !== "failed") {
                return res.status(409).json({
                    error: true,
                    message: `You have already requested for KYC. Your request is still ${existingKycRequest.isVerified}`,
                });
            }
            if (existingKycRequest.isVerified === 'failed') {
                // updateKycWithNewData
                const isUpdate = await KycModel.findByIdAndUpdate(existingKycRequest._id, {
                    vendorId, name, email, ...req.body, isVerified: "requested"
                }, { new: true })
                if (!isUpdate) return res.status(401).json({ error: true, message: "missing credentials " })
                return res.status(200).json({ error: false, message: 'success', data: isUpdate })
            }

        }



        // Create the KYC request
        const isRequested = await createTheKycRequest(req.body);

        if (!isRequested) {
            return res.status(500).json({ error: true, message: "Failed to create KYC request" });
        }

        res.status(200).json({ error: false, message: "Success", data: isRequested });
    } catch (error) {
        console.error("Error in RegisterKyc:", error);
        res.status(500).json({ error: true, message: "Internal server error" });
    }
};




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


// delete all the kyc request 
const DeleteALLKycReq = async (req, res) => {
    KycModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "success" })
    }).catch((error) => {
        console.log(error)
    })
}





module.exports = { RegisterKyc, deleteTheKycRequest, GetAllKycRequests, MakeActionKyc, DeleteALLKycReq }