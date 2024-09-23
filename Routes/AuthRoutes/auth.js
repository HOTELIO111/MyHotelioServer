const express = require("express");
const router = express.Router();
const {
  SignupUser,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  DeleteAllCustomer,
  UpdateTheUser,
  UpdateThePassword,
  Authentication,
  GetUserDataByField,
  GetAuthWIthGoogle,
  AddFieldWithOtp,
  DeleteCustomerById,
  MakeHotelFavourite,
  RemoveHotelFromFavourite,
  GetALLFavouritesHotels,
  GetAllCustomerBookings,
  GetAllCustomerBookingsWithFilter,
  SetRecommendation,
} = require("../../Controllers/AuthControllers/customerControllers");
const {
  AddVendor,
  VendorLogin,
  VendorForgotPasword,
  VendorResetPassword,
  DeleteVendors,
  GetVendorDataUpdate,
  GetAllVendor,
  GetVendorUpdate,
  DeleteVendorById,
  GetVendorById,
  GetVendorPasswordUpdate,
  GetTheHotelBooking,
  GetVendorStatusUpdate,
  VerifyOTP,
} = require("../../Controllers/AuthControllers/vendorControllers");
const {
  GetAddTheAdmin,
  AdminLoginApi,
  UpdateAdmin,
  AdminForgotPassword,
  AdminResetPassword,
} = require("../../Controllers/AuthControllers/adminControllers");
const {
  VerifyOptFormDb,
  SendOtp,
} = require("../../Controllers/Others/SendOtp");
const verify = require("../../middlewares/Verify");
const {
  GetallCustomer,
} = require("../../Controllers/admincontrollers/admincustomerManage");
const {
  UploadAvatar,
} = require("../../Controllers/AuthControllers/universalControllers");
const { HotelModifyStatus } = require("../../middlewares/hotels");

// authenticate the customer '
router.get("/authenticate", Authentication);

// Google Login Signup
router.post("/google/auth", GetAuthWIthGoogle);

// get the user
router.get("/get", GetUserDataByField);

// Get all the cuustomer
router.get("/getall", GetallCustomer);

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
router.patch("/update/:id", UpdateTheUser);
// update password
router.post("/update-pass/:id", UpdateThePassword);
// verify and update user with otp verification
router.patch("/update", AddFieldWithOtp);
// delet by id
router.get("/delete/:id", DeleteCustomerById);
// make the hotel favourites
router.get("/favourite/add/:customerid/:hotelid", MakeHotelFavourite);
// remove the hotel favourites
router.get("/favourite/remove/:customerid/:hotelid", RemoveHotelFromFavourite);
// get all the favourites hotels
router.get("/favourite/get/:customerid", GetALLFavouritesHotels);
// get all bookings
router.get("/booking/:customerid", GetAllCustomerBookingsWithFilter);
// router.post("/sendOtp/:number", SendOtpForVerify);
//
router.get("/set/recommend/:customerid", SetRecommendation);

// ==================================================== Vendor Routes =========================================================================

// vendor Login And Signup
router.post("/vendor/signup", AddVendor);
router.post("/vendor/login", VendorLogin);
// vendor forgot password
router.post("/vendor/forgot-password", VendorForgotPasword);
router.post("/vendor/verify-otp", VerifyOTP);
router.post("/vendor/reset-password", VendorResetPassword);
// get all the vendor
router.get("/vendor/getall", GetAllVendor);

// update password
router.patch("/vendor/update-password", GetVendorPasswordUpdate);
// Get Vendor By id
router.get("/vendor/get/:id", GetVendorById);

// delete vendor by id and also all hoteles delete
router.get("/vendor/delete/:id", DeleteVendorById);
// delete all vendors
router.delete("/vendor/deleteall", DeleteVendors);
// normal vendor data Update
router.patch("/vendor/update/:id", GetVendorUpdate);
// verify the email and update the data
router.patch("/vendor/verified", GetVendorDataUpdate);

router.get(
  "/vendor/update-status/:id/:status",
  HotelModifyStatus,
  GetVendorStatusUpdate
);
// router.get("/hotel/bookings/:hotelid", GetTheHotelBooking);

// =====================================================Adming Routes ===================================================================================

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

// ==================== Universal apis =========================

router.post("/upload/avatar/:userid", UploadAvatar);

module.exports = router;
