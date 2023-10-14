const {
  EncryptPassword,
  comparePassword,
} = require("../Others/PasswordEncryption");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const jwt = require("jsonwebtoken");
const { isMobileNumber, isEmail, verifyInput } = require("../utils");
require("dotenv").config();
const crypto = require("crypto");
const SendMail = require("../Others/Mailer");
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");

const CheckOtpVerify = async (isLoginwith, otp, mobileNo) => {
  let verification;
  // Verify OTP
  if (isLoginwith === "mobileNo") {
    verification = await VerificationModel.findOne({
      verificationType: "Mobile",
      verificationOtp: otp,
      sendedTo: mobileNo,
      OtpExpireTime: { $gt: new Date(Date.now()) },
    });
  } else {
    verification = await VerificationModel.findOne({
      verificationType: "Email",
      verificationOtp: otp,
      sendedTo: mobileNo,
      OtpExpireTime: { $gt: new Date(Date.now()) },
    });
  }

  return verification;
};

const Authentication = async (req, res) => {
  const { mobileNo, otp, password } = req.query;

  // check the input is email or mobile no
  const isInput = verifyInput(mobileNo);
  let user;
  // check the mobile number is already registered or not
  user = await CustomerAuthModel.findOne({ [isInput]: mobileNo });
  // verify the otp req
  const isOtpVerified = await CheckOtpVerify(isInput, otp, mobileNo);

  if (!user) {
    if (!otp)
      return res
        .status(404)
        .json({ error: true, message: "not a user and not recieved any otp " });
    // create a new user
    if (!isOtpVerified)
      return res.status(401).json({ error: true, message: "Otp Invalid" });
    user = await new CustomerAuthModel({
      [isInput]: mobileNo,
      isVerified: [isInput],
    }).save();
    if (!user)
      return res
        .status(404)
        .json({ error: true, message: "please check the data and try again" });

    // assign jwt
    const jwtPayload = {
      _id: user._id,
      [isInput]: user[isInput],
    };
    const token = jwt.sign(jwtPayload, process.env.SECRET_CODE);
    res.header("Authorization", `Bearer ${token}`);
    return res.status(201).json({
      error: false,
      data: user,
      message: "user created successfully",
      token: token,
    });
  }
  let isPasswordValid;
  if (user.password) {
    isPasswordValid = comparePassword(password, user.password, user.secretKey);
  } else {
    isPasswordValid = false;
  }

  if (isPasswordValid || isOtpVerified) {
    // assign jwt
    const jwtPayload = {
      _id: user._id,
      [isInput]: user[isInput],
    };
    //  jenerate the jwt token
    const token = jwt.sign(jwtPayload, process.env.SECRET_CODE);
    // res.header("access-token", token)
    res.header("Authorization", `Bearer ${token}`);
    res.status(200).json({ error: false, data: user, token: token });
  } else {
    // For example, log an error or track failed login attempts
    return res
      .status(400)
      .json({ error: true, message: "Invalid OTP and password" });
  }
};

// Google Login Signup Authentication

const GetAuthWIthGoogle = async (req, res) => {
  const formdata = req.body;
  if (!formdata.verified_email)
    return res
      .status(400)
      .json({ error: true, message: "please login with a verified email" });

  let finalUser;
  // find user
  const user = await CustomerAuthModel.findOne({ email: formdata.email });
  if (!user) {
    finalUser = await new CustomerAuthModel({
      email: formdata.email,
      isVerified: [formdata.email],
      avatar: formdata.picture,
      name: formdata.name,
      googleId: formdata.id,
    }).save();
  } else {
    finalUser = user;
  }

  // create jwt
  const jwtModel = {
    email: finalUser.email,
    name: finalUser.name,
    id: finalUser._id,
  };
  const token = jwt.sign(jwtModel, process.env.SECRET_CODE);
  res
    .status(200)
    .json({ error: false, data: finalUser, message: "login successfully" })
    .header("Authorization", `Bearer ${token}`);
};

// const Authentication = async (req, res) => {
//     const { mobileNo, otp, password } = req.query;

//     try {
//         let isLoginWith;

//         if (isMobileNumber(mobileNo)) {
//             isLoginWith = "mobileNo";
//         } else if (isEmail(mobileNo)) {
//             isLoginWith = "email";
//         } else {
//             return res.status(400).json({ error: true, message: "Please enter a valid email or mobile number" });
//         }

//         // Check if the user exists
//         const isUser = await CustomerAuthModel.findOne({ [isLoginWith]: mobileNo });

//         // Verify OTP
//         const isOtpVerified = await CheckOtpVerify(isLoginWith, otp, mobileNo);

//         if (isUser) {
//             if (isOtpVerified) {
//                 return res.status(200).json({ error: false, message: "Login successful with OTP", data: isUser });
//             }

//             const isPasswordValid = isUser.password === password;
//             if (!isPasswordValid) {
//                 return res.status(400).json({ error: true, message: "Invalid OTP or password" });
//             }

//             return res.status(200).json({ error: false, message: "Login successful", data: isUser });
//         }

//         if (!isOtpVerified) {
//             return res.status(400).json({ error: true, message: "Please enter a valid OTP" });
//         }

//         // Delete the verification document after successful login
//         await VerificationModel.deleteOne({ _id: isOtpVerified._id });

//         // Create a new user if not found
//         const isCreated = await new CustomerAuthModel({
//             [isLoginWith]: mobileNo,
//             isVerified: [mobileNo]
//         }).save();

//         if (!isCreated) {
//             return res.status(400).json({ error: true, message: "User registration failed. Please try again." });
//         }

//         res.status(201).json({ error: false, data: isCreated });
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };

//

// signup
const SignupUser = async (req, res) => {
  try {
    // // lets validate the data
    // const { error, value } = SingupValidate(req.body);
    // if (error) return res.status(400).json(error.details[0].message);

    // username email resgistered or not check
    // const isUserFound = await CustomerAuthModel.findOne({ email: req.body.email })
    // if (isUserFound) return res.status(409).json("Email Already Registered")

    // check the mobile no is registered or not
    const isMobile = await CustomerAuthModel.findOne({
      mobileNo: req.body.mobileNo,
    });
    if (isMobile) return res.status(409).json("Mobile No Already Registered");

    // verify the otp
    const isVarified = await VerificationModel.findOne({
      verificationOtp: req.body.otp,
      sendedTo: req.body.mobileNo,
      OtpExpireTime: { $gt: new Date(Date.now()) },
    });

    if (!isVarified)
      return res
        .status(400)
        .json({ error: true, message: "otp invalid or expired" });

    // encrypt the password
    // const hashPassword = EncryptPassword(req.body.password)

    // my formdata
    const formdata = new CustomerAuthModel({
      ...req.body,
      // password: hashPassword.hashedPassword,
      // secretKey: hashPassword.salt,
      isNumberVerified: true,
    });

    const saveData = await formdata.save();
    res.status(200).json(saveData);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Login Controller
// const LoginUser = async (req, res) => {

//     try {
//         // validate the data
//         // const { error, value } = LoginValidate(req.body);
//         // if (error) return res.status(400).json(error.details[0].message)

//         // check the user is login with email or Number
//         const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
//         if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

//         const credential = { [isLoginwith]: req.body.email }

//         // find the user
//         const User = await CustomerAuthModel.findOne(credential);
//         if (!User) return res.status(404).json({ message: "User Not Found" });
//         const { password, ...rest } = User

//         // compare the password
//         const compare = comparePassword(req.body.password, User.password, User.secretKey)
//         // const compare = bycrypt.compare(req.body.password, User.password)
//         if (!compare) return res.status(404).json({ message: "Password Incorrect" })

//         //  jenerate the jwt token
//         const token = jwt.sign(rest, process.env.SECRET_CODE)
//         res.header("access-token", token)
//         res.status(200).json(User)
//     } catch (error) {
//         res.status(500).json(error)
//     }

// }

const LoginUser = async (req, res) => {
  const { mobileNo, otp, password } = req.query;

  if (!otp && !password)
    return res.status(400).json({
      error: true,
      message: "please enter otp or password any of things",
    });

  // check the account with mobile no
  const isFound = await CustomerAuthModel.findOne({ mobileNo: mobileNo });
  if (!isFound)
    return res
      .status(404)
      .json({ error: true, message: "No user found with this number" });

  // verify the otp
  const isVarified = await VerificationModel.findOne({
    verificationOtp: otp,
    sendedTo: mobileNo,
    OtpExpireTime: { $gt: new Date(Date.now()) },
  });

  if (!isVarified)
    return res
      .status(400)
      .json({ error: true, message: "otp invalid or expired" });

  const jwtPayload = {
    _id: isFound._id,
    mobileNo: isFound.mobileNo,
  };
  //  jenerate the jwt token
  const token = jwt.sign(jwtPayload, process.env.SECRET_CODE);
  res.header("access-token", token);
  res.status(200).json(isFound);
};

// forgot Password

const ForgotPassword = async (req, res) => {
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
  const isUser = await CustomerAuthModel.findOne(credential);
  if (!isUser)
    return res.status(404).json({ error: true, message: "No User Found" });

  // generate the resetlink
  const resetUrl = crypto.randomBytes(20).toString("hex");

  // store the link in the person db
  isUser.resetLink = resetUrl;
  isUser.resetDateExpires = Date.now() + 120000; // resetLink Valid only for 1 hour
  await isUser.save();

  // prepare a mail to send reset mail
  const mailOptions = {
    from: process.env.SENDEREMAIL,
    to: req.body.email,
    subject: "Reset Password",
    html: EmailForResetLink(
      isUser.name,
      `${req.header.origin}/reset-password/${resetUrl}`
    ),
  };

  // send Mail
  const send = SendMail(mailOptions);
  if (!send) return res.status(400).json("Email Not Sent");

  res.status(200).json("reset email sended successfully");
};

// reset my password

const ResetPassword = async (req, res) => {
  const { resetLink, newPassword } = req.body;

  // find user with reset Link
  const user = await CustomerAuthModel.findOne({
    resetLink: resetLink,
    resetDateExpires: { $gt: new Date(Date.now()) },
  });
  if (!user)
    return res
      .status(400)
      .json({ error: true, message: "Invalid or expired token'" });

  try {
    // convert the password in encryptedway
    const hashedPassword = EncryptPassword(newPassword);
    // check the the reset time is expired or not
    user.password = hashedPassword.hashedPassword;
    user.secretKey = hashedPassword.salt;
    user.resetLink = undefined;
    user.resetDateExpires = undefined;
    await user.save();
    res
      .status(200)
      .json({ error: false, message: "password Changed Successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// delete al the user
const DeleteAllCustomer = async (req, res) => {
  CustomerAuthModel.deleteMany({})
    .then(() => {
      res.status(200).json({ error: false, message: "" });
    })
    .catch((error) => {
      console.log(error);
    });
};

// update the user
const UpdateTheUser = async (req, res) => {
  // check the user Exists
  const id = req.params.id;
  const formData = req.body;

  try {
    const response = await CustomerAuthModel.findById(id);
    if (!response)
      return res.status(404).json({ error: true, message: "No user Found" });

    if (formData.password) {
      const hashedPassword = EncryptPassword(req.body.password);
      formData.password = hashedPassword.hashedPassword;
      formData.secretKey = hashedPassword.salt;
    }
    // let Update the user
    const isUpdated = await CustomerAuthModel.findByIdAndUpdate(
      id,
      {
        ...formData,
      },
      { new: true }
    );
    if (!isUpdated)
      return res
        .status(400)
        .json({ error: true, message: "No Updated Something error" });

    res.status(200).json({ error: false, data: isUpdated });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Update the password
const UpdateThePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { id: otpId, otp, password: newPassword } = req.body;

    // Find the user by ID
    const user = await CustomerAuthModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "User authentication error. Please try again.",
      });
    }

    // Verify the OTP in the database
    const verifiedOTP = await VerificationModel.findOne({
      _id: otpId,
      verificationOtp: otp,
      OtpExpireTime: { $gt: new Date() },
    });

    if (!verifiedOTP) {
      return res
        .status(404)
        .json({ error: true, message: "OTP expired or not found." });
    }

    // Encrypt the new password
    const encryptedPassword = EncryptPassword(newPassword);

    // Update the password
    const updatedUser = await CustomerAuthModel.findByIdAndUpdate(
      userId,
      {
        password: encryptedPassword.hashedPassword,
        secretKey: encryptedPassword.salt,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(400)
        .json({ error: true, message: "Error updating user data." });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Password updated successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "An internal server error occurred." });
  }
};

const GetUserDataByField = async (req, res) => {
  const { field } = req.query;

  const isLoginwith =
    isMobileNumber(field) === true
      ? "mobileNo"
      : isEmail(field) === true
      ? "email"
      : "Invalid Input";
  if (isLoginwith === "Invalid Input")
    return res.status(400).json({
      error: true,
      message: "Please Enter the Valid Email Or Mobile No",
    });

  const credential = { [isLoginwith]: field };
  try {
    const response = await CustomerAuthModel.findOne(credential);
    if (!response)
      return res.status(404).json({ error: true, message: "no user found" });
    res.status(200).json({ error: false, data: response });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const AddFieldWithOtp = async (req, res) => {
  try {
    const { id, otpid, otp, key, value } = req.query;
    // Verify the OTP
    const isVerified = await VerificationModel.findOne({
      _id: otpid,
      OtpExpireTime: { $gt: Date.now() },
    });

    if (!isVerified) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid Otp Request" });
    }

    // check the field is already register or not
    const ifFound = await CustomerAuthModel.findOne({ [key]: value });
    if (ifFound)
      return res.status(404).json({
        error: true,
        message: `${value} already registered with a account`,
      });

    // check the expiry

    if (!isVerified.verificationOtp === otp)
      return res.status(400).json({ error: true, message: "Incorrect Otp" });

    // If verified, then update the field
    const isUpdated = await CustomerAuthModel.findByIdAndUpdate(
      id,
      {
        [key]: value,
      },
      { new: true }
    );

    if (!isUpdated) {
      return res.status(400).json({ error: true, message: "Updation failed" });
    }

    return res.status(200).json({
      error: false,
      message: "Updation successfully",
      data: isUpdated,
    });
  } catch (error) {
    console.error("Error in AddFieldWithOtp:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

// delete custome by id
const DeleteCustomerById = async (req, res) => {
  const { id } = req.params.id;
  CustomerAuthModel.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json("successfull deleted");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
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
};
