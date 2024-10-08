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
console.log("Inside sendmobile otp");
const SendMobileVefication = async (req, res) => {
  try {
    // Extract the mobile number from the request parameters
    const { number } = req.params;
    if (number === process.env.TEST_NUMBER) {
      const testOtp = process.env.TEST_OTP;
      const isStored = await new VerificationModel({
        verificationType: "Mobile",
        verificationOtp: testOtp,
        OtpExpireTime: Date.now() + 300000, // 5 minutes timer (300,000 milliseconds)
        sendedTo: number,
      }).save();

      if (!isStored) {
        return res.status(400).json({ error: true, message: "OTP Not sent" });
      }

      return res.status(200).json({
        error: false,
        data: isStored._id,
        message: "Test OTP sent successfully",
      });
    }

    const otp = crypto.randomInt(1000, 9999);

    const response = await axios.get(
      `https://sms.whistle.mobi/sendsms.jsp?user=Houdact&password=912be393a7XX&senderid=HOTLIO&mobiles=+91${number}&sms=${otp}%20is%20your%20account%20verification%20OTP.%20Treat%20this%20as%20confidential.%20Don%27t%20share%20this%20with%20anyone%20(otp)%20Houda%20Carjour%20Tourism`
    );

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
    if (otp === process.env.TEST_OTP) {
      const verificationRecord = await VerificationModel.findById(otpid);
      if (
        verificationRecord &&
        verificationRecord.sendedTo === process.env.TEST_NUMBER
      ) {
        return res
          .status(200)
          .json({ error: false, message: "Test OTP Verified" });
      }
    }

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
