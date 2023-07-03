const express = require('express');
const router = express.Router();
const { SingupValidate, LoginValidate } = require('../../validate');
const { SignupUser, LoginUser, ForgotPassword, ResetPassword } = require("../../Controllers/AuthControllers/CustomerAuth")
const { AddVendor, VendorLogin } = require("../../Controllers/AuthControllers/VendorAuthController")


// signup the user
router.post("/signup", SignupUser);
// login the user 
router.post("/login", LoginUser);
// forgot password
router.post("/forgot-password", ForgotPassword);
// reset password
router.post("/reset-password", ResetPassword);


// vendor Login And Signup 

router.post("/vendor/signup", AddVendor)
router.post("/vendor/login", VendorLogin)




module.exports = router