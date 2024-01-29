const { emailFormat, Contactus } = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");
const SendMail = require("../Others/Mailer");
require("dotenv").config();
const crypto = require("crypto");
const { isMobileNumber, isEmail } = require("../utils");
const { default: axios } = require("axios");

// need to modify more
const SendEmailVerify = async (req, res) => {
  try {
    const { email, name, format } = req.query;
    const otp = crypto.randomInt(1000, 9999);

    const emailFormats = {
      contact: Contactus({ name, email }),
      otp: emailFormat(otp),
      notification: "<h1>This is notification from hotelio</h1>",
    };

    const mailOptions = {
      from: process.env.SENDEREMAIL,
      to: email,
      html: emailFormats[format],
    };

    if (format === "contact") {
      mailOptions.cc = process.env.CCMAIL;
      mailOptions.subject = `${name} Enquiry`;
    } else {
      mailOptions.subject = "Email Verification Code";
    }

    const verificationModelData = {
      verificationType: "Email",
      verificationOtp: otp,
      sendedTo: email,
      OtpExpireTime: Date.now() + 300000,
    };

    const isAdded =
      format === "otp"
        ? await new VerificationModel(verificationModelData).save()
        : null;

    const isSent = await SendMail(mailOptions);

    if (isSent) {
      res.status(200).json({
        error: false,
        message: "Email sent successfully",
        data: isAdded._id,
      });
    } else {
      throw new Error("Email not sent");
    }
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
};



const SendMobileVefication = async (req, res) => {
  try {
    // Extract the mobile number from the request parameters
    const { number } = req.params;
    const otp = crypto.randomInt(1000, 9999);

    const optData = {
      user: process.env.W_USER,
      password: process.env.W_PASSWORD,
      senderid: process.env.W_SENDERID,
      mobiles: `+91${number}`, // Removed space after '+'
      sms: `${otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone @www.hoteliorooms.com # (otp)`,
    };

    const queryString = Object.keys(optData)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(optData[key])}`
      )
      .join("&");

    const response = await axios.get(process.env.W_URL + queryString);

    if (response.status !== 200) {
      return res
        .status(400)
        .json({ error: true, message: "OTP failed! Please try again." });
    }

    const isStored = await new VerificationModel({
      verificationType: "Mobile",
      verificationOtp: otp,
      OtpExpireTime: Date.now() + 300000, // 5 minutes timer (300,000 milliseconds)
      sendedTo: number,
    }).save();

    if (!isStored) {
      return res.status(400).json({ error: true, message: "OTP Not sent" });
    }

    // Return a success response
    res.status(200).json({
      error: false,
      data: isStored._id,
      message: "OTP sent successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

const VerifyOtp = async (req, res) => {
  const { otpid, otp } = req.query;
  try {
    const verified = await VerificationModel.findOne({
      _id: otpid,
      OtpExpireTime: { $gt: Date.now() },
    });
    if (!verified)
      return res.status(404).json({ error: true, message: "otp Expired" });

    if (!(verified.verificationOtp === otp))
      return res.status(400).json({ error: true, message: "Incorrect Otp" });

    return res.status(200).json({ error: false, message: "OTP Verified" });
  } catch (error) {
    console.error("Error occurred during OTP verification:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { SendEmailVerify, SendMobileVefication, VerifyOtp };
