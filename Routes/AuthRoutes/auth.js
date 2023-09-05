const express = require('express');
const router = express.Router();
const { SignupUser, LoginUser, ForgotPassword, ResetPassword, DeleteAllCustomer, UpdateTheUser, UpdateThePassword, Authentication, GetUserDataByField, GetAuthWIthGoogle, AddFieldWithOtp, DeleteCustomerById } = require("../../Controllers/AuthControllers/customerControllers")
const { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword, DeleteVendors, GetVendorDataUpdate, GetAllVendor, GetVendorUpdate } = require("../../Controllers/AuthControllers/vendorControllers")
const { GetAddTheAdmin, AdminLoginApi, UpdateAdmin, AdminForgotPassword, AdminResetPassword } = require('../../Controllers/AuthControllers/adminControllers')
const { VerifyOptFormDb, SendOtp } = require("../../Controllers/Others/SendOtp")
const verify = require("../../middlewares/Verify")

// authenticate the customer '
router.get("/authenticate", Authentication)
// Google Login Signup
router.post("/google/auth", GetAuthWIthGoogle)

// get the user 
router.get("/get", GetUserDataByField)

// signup the user
router.post("/signup", SignupUser);
// login the user 
router.get("/login", LoginUser);
// forgot password
router.post("/forgot-password", ForgotPassword);
// reset password
router.post("/reset-password", ResetPassword);
// delete all user 
router.delete("/deleteall", DeleteAllCustomer);
// Update the Customer
router.patch("/update/:id", UpdateTheUser)
// update password
router.post("/update-pass/:id", UpdateThePassword);
// verify and update user with otp verification  
router.patch('/update', AddFieldWithOtp);
// delet by id 
router.get("/delete/:id", DeleteCustomerById);

// router.post("/sendOtp/:number", SendOtpForVerify);


// vendor Login And Signup 

router.post("/vendor/signup", AddVendor);
router.post("/vendor/login", VendorLogin);
router.post("/vendor/forgot-password", VendorForgotPasword);
router.post("/vendor/reset-password", VendorResetPassword);
router.get("/vendor/getall", GetAllVendor);
router.delete("/vendor/deleteall", DeleteVendors);
// normal vendor data Update 
router.patch("/vendor/update/:id", GetVendorUpdate);
// verify the email and update the data
router.patch("/vendor/verified", GetVendorDataUpdate);



// admin SOme Routes 
router.post("/admin/signup", GetAddTheAdmin);
// admin login 
router.post("/admin/login", AdminLoginApi);
// admin forgot password
router.post("/admin/forgot-password", AdminForgotPassword);
// admin reset password 
router.post("/reset-password", AdminResetPassword);
// admin update the data 
router.patch("/admin/update/:id", UpdateAdmin);


// SEND OTP FROM TWILLO 
router.get("/sendopt/:number", SendOtp);
router.get("/verifyotp/:key/:otp", VerifyOptFormDb);





module.exports = router