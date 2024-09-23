const router = require("express").Router();
const { SendEmailVerify, SendMobileVefication, VerifyOtp, verifyMobileOtp } = require("../../Controllers/VerificationController/VerificationControllers")

// send mail verification code
router.get("/email", SendEmailVerify);
// on mobile verification 
router.get("/mobile/:number", SendMobileVefication);
// verify the email otp 
router.get("/verify-otp", VerifyOtp);








module.exports = router;