const VerificationModel = require("../Model/other/VerificationModel")

const isOtpVerify = async (otp, otpid) => {
    try {
        const checkOtp = await VerificationModel.findOne({
            _id: otpid,
            OtpExpireTime: { $gt: Date.now() }
        })
        if (!checkOtp) return { error: true, message: "Otp Expired" }

        if (checkOtp.verificationOtp !== otp) return { error: true, message: "Invalid Otp" }
        return { error: false, message: "success Varified" }
    } catch (error) {
        return { error: true, message: error.message }
    }
}

module.exports = { isOtpVerify }