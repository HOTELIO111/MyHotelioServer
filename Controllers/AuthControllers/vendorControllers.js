const VendorModel = require("../../Model/HotelModel/vendorModel");
const SendMail = require("../Others/Mailer");
const {
  EncryptPassword,
  comparePassword,
} = require("../Others/PasswordEncryption");
const { isEmail, isMobileNumber } = require("../utils");
const crypto = require("crypto");
require("dotenv").config();
// const fast2sms = require('fast-two-sms');
const jwt = require("jsonwebtoken");
const {
  EmailForResetLink,
  EmailForOTP,
} = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");
const {
  DeleteTheSingleVendor,
  DeleteAllVendor,
  VendorPasswordUpdate,
} = require("../../helper/vendor/vendorhelpers");
const { isOtpVerify } = require("../../helper/misc");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const { _isUserKyc } = require("../../helper/vendor/kycHelpers");
const { default: mongoose } = require("mongoose");
const GenerateNotificatonsData = require("../../functions/GenerateNotificationsData");
const { NotificationManagementQueue } = require("../../jobs");
const { events } = require("../../config/notificationEvents");
const { default: axios } = require("axios");
const xml2js = require("xml2js");
const smsService = require("../notifications/sms/smsService");

const AddVendor = async (req, res) => {
  const formData = req.body;

  // Check if the user is already present by email
  const isUser = await VendorModel.findOne({ email: req.body.email });
  if (isUser) {
    return res
      .status(409)
      .json({ error: true, message: "Email Already Registered" });
  }

  // Check if the user is already present by mobile number
  const isUserWithMobile = await VendorModel.findOne({
    mobileNo: req.body.mobileNo,
  });
  if (isUserWithMobile) {
    return res
      .status(409)
      .json({ error: true, message: "Mobile Number Already Registered" });
  }

  // Make the password a hashed password
  const hashPassword = EncryptPassword(req.body.password);

  try {
    const result = await new VendorModel({
      ...formData,
      role: formData.role ? formData.role : "vendor",
      password: hashPassword.hashedPassword,
      secretKey: hashPassword.salt,
    }).save();

    // ================================ Notification System ===================================
    const notifyData = GenerateNotificatonsData({
      partner: {
        ...result._doc,
        name: result._doc.name || result._doc.email || result._doc.mobileNo,
      },
      admin: {
        name: result._doc.name || result._doc.email || result._doc.mobileNo,
        ...result._doc,
      },
    });

    NotificationManagementQueue.add(
      `eventNotification: ${events.PARTNER_REGISTER}`,
      {
        eventId: events.PARTNER_REGISTER,
        data: notifyData,
      }
    );

    // ======= End Notification System, this is currently not working adding a not scalable approach for now ======

    smsService.sendVendorRegistrationSMS({
      vendorMobileNumber: result.mobileNo,
    });

    // ================================ Notification System ===================================

    const jwtTokenValue = {
      _id: result._id,
      name: result.name,
    };
    const accessToken = jwt.sign(jwtTokenValue, process.env.SECRET_CODE);
    res.header("Authorization", `Bearer ${accessToken}`);
    res.status(200).json({
      error: false,
      data: result,
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const VendorLogin = async (req, res) => {
  // check the user is login with email or Number
  const isLoginwith =
    isMobileNumber(req.body.email) === true
      ? "mobileNo"
      : isEmail(req.body.email) === true
      ? "email"
      : "Invalid Input";
  if (isLoginwith === "Invalid Input")
    return res.status(400).json({
      error: true,
      message: "Please Enter the Valid Email Or Mobile No",
    });

  const credential = { [isLoginwith]: req.body.email };

  try {
    const result = await VendorModel.aggregate([
      { $match: credential },
      {
        $lookup: {
          from: "kyc-requests",
          localField: "email",
          foreignField: "email",
          as: "kyc",
        },
      },
    ]);
    if (!result[0])
      return res.status(404).json({ error: true, message: "No User Found" });
    const { passsword, ...rest } = result[0];
    // compare the password
    const isPasswordCorrect = comparePassword(
      req.body.password,
      result[0].password,
      result[0].secretKey
    );
    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ error: true, message: "Password is Incorrect" });

    // access token generate and store
    const jwtTokenValue = {
      _id: result[0]._id,
      name: result[0].name,
    };
    const accesstoken = jwt.sign(jwtTokenValue, process.env.SECRET_CODE);
    res.header("Authorization", `Bearer ${accesstoken}`);
    res.status(200).json({
      error: false,
      data: result[0],
      token: accesstoken,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// forgot Password

const VendorForgotPasword = async (req, res) => {
  // check the user is login with email or Number
  const isLoginwith =
    isMobileNumber(req.body.email) === true
      ? "mobileNo"
      : isEmail(req.body.email) === true
      ? "email"
      : "Invalid Input";
  if (isLoginwith === "Invalid Input")
    return res.status(400).json({
      error: true,
      message: "Please Enter the Valid Email Or Mobile No",
    });

  const credential = { [isLoginwith]: req.body.email };

  // find the user
  const isUser = await VendorModel.findOne(credential);
  if (!isUser)
    return res.status(404).json({ error: true, message: "No User Found" });

  // generate the resetlink
  // const resetUrl = crypto.randomBytes(20).toString("hex");

  // // store the link in the person db
  // isUser.resetLink = resetUrl;
  // isUser.resetDateExpire = Date.now() + 120000; // resetLink Valid only for 1 hour
  // await isUser.save();

  // Generate otp
  const otp = crypto.randomInt(1000, 9999).toString();
  const otpExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  // Send this otp via mail if isLoginWith is email else send with mobile

  isUser.otp = otp;
  isUser.otpExpire = otpExpire;
  await isUser.save();
  // prepare a mail to send reset mail
  const mailOptions = {
    from: process.env.SENDEREMAIL,
    to: req.body.email,
    subject: "Reset Password",
    html: EmailForOTP(isUser.name, otp),
  };

  const smsOptions = {
    user: process.env.W_USER,
    password: process.env.W_PASSWORD,
    senderid: process.env.W_SENDERID,
    mobiles: `+91${req.body.email}`,
    sms: `${otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone @www.hoteliorooms.com # (otp)`,
  };

  if (isLoginwith === "email") {
    // Send Mail
    const send = SendMail(mailOptions);
    if (!send) {
      return res.status(400).json({
        error: true,
        msg: "Email Not Sent",
      });
    }

    return res.status(200).json({
      error: false,
      msg: `OTP sent successfully to ${req.body.email}`,
    });
  } else {
    // Send sms
    const queryString = Object.keys(smsOptions)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(smsOptions[key])}`
      )
      .join("&");

    const response = await axios.get(`${process.env.W_URL}?${queryString}`);
    const parser = new xml2js.Parser();
    parser.parseString(response.data, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          msg: "Error parsing SMS API response",
        });
      }

      const status = result.smslist.sms[0].status[0];
      const reason = result.smslist.sms[0].reason[0];

      if (status === "error") {
        return res.status(400).json({
          error: true,
          msg: `SMS Not Sent: ${reason}`,
        });
      }

      return res.status(200).json({
        error: false,
        msg: `OTP sent successfully to ${req.body.email}`,
      });
    });
  }
};

// Verify otp
const VerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  // Validate input
  if (!email || !otp) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  // Check if the user is logging in with email or mobile number
  const isLoginWith = isMobileNumber(email)
    ? "mobileNo"
    : isEmail(email)
    ? "email"
    : "Invalid Input";

  if (isLoginWith === "Invalid Input") {
    return res.status(400).json({
      error: true,
      message: "Please Enter a Valid Email or Mobile Number",
    });
  }

  const credential = { [isLoginWith]: email };

  // Find the user
  const isUser = await VendorModel.findOne(credential);
  if (!isUser) {
    return res.status(404).json({ error: true, message: "No User Found" });
  }

  // Check if OTP is valid
  if (isUser.otp !== otp || Date.now() > isUser.otpExpire) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid or Expired OTP" });
  }

  res.status(200).json({
    error: false,
    message: "OTP verified successfully",
  });
};

// Reset password
const VendorResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate input
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  // Check if the user is logging in with email or mobile number
  const isLoginWith = isMobileNumber(email)
    ? "mobileNo"
    : isEmail(email)
    ? "email"
    : "Invalid Input";

  if (isLoginWith === "Invalid Input") {
    return res.status(400).json({
      error: true,
      message: "Please Enter a Valid Email or Mobile Number",
    });
  }

  const credential = { [isLoginWith]: email };

  // Find the user
  const isUser = await VendorModel.findOne(credential);
  if (!isUser) {
    return res.status(404).json({ error: true, message: "No User Found" });
  }

  // Check if OTP is valid
  if (isUser.otp !== otp || Date.now() > isUser.otpExpire) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid or Expired OTP" });
  }

  // Reset password
  const hashPassword = EncryptPassword(newPassword);
  isUser.password = hashPassword.hashedPassword;
  isUser.secretKey = hashPassword.salt;
  isUser.otp = null;
  isUser.otpExpire = null;
  await isUser.save();

  res.status(200).json({
    error: false,
    message: "Password has been reset successfully",
  });
};

// reset my password

// const VendorResetPassword = async (req, res) => {
//   const { resetLink, newPassword } = req.body;

//   // find user with reset Link
//   const user = await VendorModel.findOne({
//     resetLink: resetLink,
//     resetDateExpire: { $gt: new Date(Date.now()) },
//   });
//   if (!user)
//     return res
//       .status(400)
//       .json({ error: true, message: "Invalid or expired token'" });

//   try {
//     // convert the password in encryptedway
//     const hashedPassword = EncryptPassword(newPassword);
//     // check the the reset time is expired or not
//     user.password = hashedPassword.hashedPassword;
//     user.secretKey = hashedPassword.salt;
//     user.resetLink = undefined;
//     user.resetDateExpire = undefined;
//     await user.save();
//     res
//       .status(200)
//       .json({ error: false, message: "password Changed Successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };

// delete al the user
const DeleteVendors = async (req, res) => {
  try {
    const isDeleted = await DeleteAllVendor();
    if (!isDeleted)
      return res
        .status(404)
        .json({ error: true, message: "faild to delete ! try agian " });

    res.status(200).json({ error: false, message: "success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

//     const mobileNo = req.params.number;

//     const otp = crypto.randomInt(1000, 9999);

//     const options = {
//         authorization: "ORSFP20JViWFJgEia0VrX2jxeLccOZF0mEj7C4QygIoPTNhhKFobDSr2wLm0",
//         message: `This is an OTP verification message from Hotelio. Your OTP is ${otp}`,
//         numbers: [mobileNo]

//     };

//     try {
//         const response = await fast2sms.sendMessage(options);
//         res.status(200).json(response);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// };
const GetVendorDataUpdate = async (req, res) => {
  try {
    const { otp, otpid, cid } = req.query;

    // Data from the request body
    const formData = req.body;

    // Find the OTP request
    const isReq = await VerificationModel.findOne({
      _id: otpid,
      OtpExpireTime: { $gt: Date.now() },
    });

    // check the expirys
    if (!isReq) {
      return res.status(400).json({ error: true, message: "OTP Expired" });
    }

    // Check if the OTP matches
    if (isReq.verificationOtp !== otp) {
      return res.status(404).json({ error: true, message: "Invalid OTP" });
    }

    // OTP verification successful
    const verifiedWith =
      isReq.verificationType === "Mobile"
        ? "isNumberVarified"
        : "isEmailVerified";

    // Update the data for the vendor
    const isUpdated = await VendorModel.findByIdAndUpdate(
      cid,
      {
        ...formData,
        [verifiedWith]: true,
        kycVerified: true,
      },
      { new: true }
    );

    if (!isUpdated) {
      return res.status(400).json({ error: true, message: "Updation Error" });
    }

    res.status(200).json({ error: false, data: isUpdated });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// get all the vendor
const GetAllVendor = async (req, res) => {
  try {
    const alldata = await VendorModel.find({}).sort({ createdAt: -1 });
    if (!alldata)
      return res.status(404).json({ error: true, message: "No data Found" });
    res.status(200).json({ error: false, data: alldata });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const GetVendorUpdate = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  try {
    const response = await VendorModel.findByIdAndUpdate(id, formData, {
      new: true,
    });
    if (!response)
      return (400).json({ error: true, message: "update failed try again" });

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteVendorById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await DeleteTheSingleVendor(id);
    if (!response)
      return res.status(404).json({ error: true, message: "user not found" });

    res.status(200).json({ error: false, message: "deleted succesfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get Vendor by id

const GetVendorById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "kyc-requests",
          localField: "email",
          foreignField: "email",
          as: "kyc",
        },
      },
    ]);
    if (!user)
      return res.status(204).json({ error: true, message: "no user found" });
    res.status(200).json({ error: false, message: "success", data: user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get pasword Update of the vendor

const GetVendorPasswordUpdate = async (req, res) => {
  const { otpid, otp } = req.query;
  const { email, password } = req.body;

  if (!otpid && !otp && !email && !password)
    return res
      .status(400)
      .json({ error: true, message: "Please Check the parameters" });
  try {
    // check the otp varification
    const isVerified = await isOtpVerify(otp, otpid);
    if (isVerified.error === true) return res.status(400).json(isVerified);

    // update the password
    const updatePassword = await VendorPasswordUpdate(email, password);
    res
      .status(updatePassword.status)
      .json({ error: updatePassword.error, message: updatePassword.message });
  } catch (error) {}
};

// const GetTheHotelBooking = async (req, res) => {
//   const { hotelid } = req.params;
//   try {
//     const response = await HotelModel.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(hotelid) } },
//       // {
//       //   $lookup: {
//       //     from: "bookings",
//       //     localField: "bookings",
//       //     foreignField: "_id",
//       //     pipeline: [
//       //       {
//       //         $lookup: {
//       //           from: "hotels",
//       //           localField: "hotel",
//       //           foreignField: "_id",
//       //           pipeline: [
//       //             {
//       //               $lookup: {
//       //                 from: "room-categories",
//       //                 localField: "rooms.roomType",
//       //                 foreignField: "_id",
//       //                 pipeline: [
//       //                   {
//       //                     $lookup: {
//       //                       from: "amenities",
//       //                       localField: "amenties",
//       //                       foreignField: "_id",
//       //                       pipeline: [
//       //                         {
//       //                           $group: {
//       //                             _id: "amenites",
//       //                             title: { $push: "$title" },
//       //                           },
//       //                         },
//       //                       ],
//       //                       as: "Amenty",
//       //                     },
//       //                   },
//       //                   { $unwind: "$Amenty" },
//       //                   {
//       //                     $lookup: {
//       //                       from: "facilities",
//       //                       localField: "includeFacilities",
//       //                       foreignField: "_id",
//       //                       pipeline: [
//       //                         {
//       //                           $group: {
//       //                             _id: "facilities",
//       //                             title: { $push: "$title" },
//       //                           },
//       //                         },
//       //                       ],
//       //                       as: "Facility",
//       //                     },
//       //                   },
//       //                   { $unwind: "$Facility" },
//       //                   {
//       //                     $project: {
//       //                       _id: 1,
//       //                       personAllowed: 1,
//       //                       includeFacilities: 1,
//       //                       amenties: "$Amenty.title",
//       //                       includeFacilities: "$Facility.title",
//       //                       title: 1,
//       //                     },
//       //                   },
//       //                 ],
//       //                 as: "roomTypeData",
//       //               },
//       //             },
//       //             {
//       //               $project: {
//       //                 hotelCoverImg: 1,
//       //                 hotelName: 1,
//       //                 hotelRatings: 1,
//       //                 reviews: 1,
//       //                 rooms: {
//       //                   $map: {
//       //                     input: "$rooms",
//       //                     as: "room",
//       //                     in: {
//       //                       counts: {
//       //                         $sum: {
//       //                           $subtract: [
//       //                             { $toInt: "$$room.counts" }, // Convert to integer if not already
//       //                             {
//       //                               $let: {
//       //                                 vars: {
//       //                                   decreasedArray: {
//       //                                     $filter: {
//       //                                       input: "$roomCountData",
//       //                                       as: "roomCo",
//       //                                       cond: {
//       //                                         $and: [
//       //                                           {
//       //                                             $eq: [
//       //                                               "$$roomCo.roomid",
//       //                                               "$$room._id",
//       //                                             ],
//       //                                           },
//       //                                           {
//       //                                             $eq: ["$$roomCo.will", "dec"],
//       //                                           },
//       //                                         ],
//       //                                       },
//       //                                     },
//       //                                   },
//       //                                   increasedArray: {
//       //                                     $filter: {
//       //                                       input: "$roomCountData",
//       //                                       as: "roomCo",
//       //                                       cond: {
//       //                                         $and: [
//       //                                           {
//       //                                             $eq: [
//       //                                               "$$roomCo.roomid",
//       //                                               "$$room._id",
//       //                                             ],
//       //                                           },
//       //                                           {
//       //                                             $eq: ["$$roomCo.will", "inc"],
//       //                                           },
//       //                                         ],
//       //                                       },
//       //                                     },
//       //                                   },
//       //                                 },
//       //                                 in: {
//       //                                   $sum: {
//       //                                     $subtract: [
//       //                                       { $sum: "$$decreasedArray.rooms" },
//       //                                       { $sum: "$$increasedArray.rooms" },
//       //                                     ],
//       //                                   },
//       //                                 },
//       //                               },
//       //                             },
//       //                           ],
//       //                         },
//       //                       },
//       //                       roomType: {
//       //                         $arrayElemAt: [
//       //                           {
//       //                             $filter: {
//       //                               input: "$roomTypeData",
//       //                               as: "roomTypes",
//       //                               cond: {
//       //                                 $eq: [
//       //                                   "$$roomTypes._id",
//       //                                   "$$room.roomType",
//       //                                 ],
//       //                               },
//       //                             },
//       //                           },
//       //                           0,
//       //                         ],
//       //                       },
//       //                       price: "$$room.price",
//       //                       // status: "$$room.status",
//       //                       additionAmenities: "$$room.additionAmenities",
//       //                       // roomConfig: "$$room.roomConfig",
//       //                       additionalFacilties: "$$room.additionalFacilties",
//       //                       _id: "$$room._id",
//       //                     },
//       //                   },
//       //                 },
//       //                 discription: 1,
//       //               },
//       //             },
//       //           ],
//       //           as: "hotel",
//       //         },
//       //       },
//       //       { $sort: { createdAt: -1 } },
//       //     ],
//       //     as: "bookings",
//       //   },
//       // },
//       // {
//       //   $project: {
//       //     bookings: 1,
//       //   },
//       // },
//     ]);
//     res.status(200).json({ error: false, message: "success", data: response });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//   }
// };

const GetVendorStatusUpdate = async (req, res) => {
  const { id, status } = req.params;
  try {
    const response = await VendorModel.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true }
    );
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
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
  GetVendorStatusUpdate,
  VerifyOTP,
  // GetTheHotelBooking,
};
