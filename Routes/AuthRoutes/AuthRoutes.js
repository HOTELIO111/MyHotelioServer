const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const { SingupValidate, LoginValidate } = require('../../validate');
const { SignupUser, LoginUser, ForgotPassword, ResetPassword, DeleteAllCustomer } = require("../../Controllers/AuthControllers/CustomerAuth")
const { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword } = require("../../Controllers/AuthControllers/VendorAuthController")


// signup the user
router.post("/signup", SignupUser);
// login the user 
router.post("/login", LoginUser);
// forgot password
router.post("/forgot-password", ForgotPassword);
// reset password
router.post("/reset-password", ResetPassword);
// delete all user 
router.delete("/deleteCustomers", DeleteAllCustomer);


// vendor Login And Signup 

router.post("/vendor/signup", AddVendor);
router.post("/vendor/login", VendorLogin);
router.post("/vendor/forgot-password", VendorForgotPasword);
router.post("/vendor/reset-password", VendorResetPassword);




module.exports = router