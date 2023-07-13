const router = require("express").Router();
const { SendEmailVerify, SendMobileVefication, verifyEmailOtp, verifyMobileOtp } = require("../../Controllers/VerificationController/VerificationControllers")

// send mail verification code
router.post("/email", SendEmailVerify);
// on mobile verification 
router.get("/mobile/:number", SendMobileVefication);
// verify the email otp 
router.get("/email/verify/:id", verifyEmailOtp);
// verify Mobile Number 
router.get("/mobile/verify/:id", verifyMobileOtp);





module.exports = router;