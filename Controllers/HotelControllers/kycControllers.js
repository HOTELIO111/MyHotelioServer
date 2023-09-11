const { createTheKycRequest, DeleteTheKycRequest } = require("../../helper/vendor/kycHelpers");



// register the kyc req 
const RegisterKyc = async (req, res) => {
    const { vendorId, name, email, aadharNo, panNo, aadharImg, panImg } = req.body;
    try {
        if (!vendorId && !name && !email && !aadharNo && !panNo && !aadharImg && !panImg) return res.status(401).json({ error: true, message: "Invalid Credential" })

        const isRequested = await createTheKycRequest(req.body)
        if (!isRequested) return res.status(400).json({ error: true, message: "failed !try  again" })

        res.status(200).json({ error: false, message: "success", data: isRequested })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


const KycVerified = async (req, res) => {

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



module.exports = { RegisterKyc, deleteTheKycRequest }