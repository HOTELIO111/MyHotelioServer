const { default: axios } = require("axios");
const { emailFormat } = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");
const SendMail = require("../Others/Mailer");
require('dotenv').config();
const crypto = require("crypto");
const twilio = require('twilio');

// Create a Twilio client instance
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const twilioClient = twilio(accountSid, authToken);



const SendEmailVerify = async (req, res) => {
    try {
        const email = req.body.email; // Get the email from the request body
        const name = req.body.name; // Get the name from the request body

        // Generate the OTP
        const otp = crypto.randomInt(100000, 999999); // Generate a new OTP if there is no previous entry

        // Create the email content using the provided name and OTP
        const EmailContent = emailFormat(name, otp);

        const mailOptions = {
            from: process.env.SENDEREMAIL, // Set the sender's email address
            to: email, // Set the recipient's email address
            subject: "Email Verification Code", // Set the email subject
            html: EmailContent // Set the email content
        };

        // Store the verification request in the database
        const isAdded = await new VerificationModel({
            verificationType: "Email",
            verificationOtp: otp,
            sendedTo: email,
            OtpExpireTime: Date.now() + 300000 // Set the expiration time to 5 minutes from the current time
        }).save();

        if (!isAdded) {
            throw new Error("Email not sent"); // Throw an error if the verification request is not added to the database
        }

        // Send the email
        const isSent = await SendMail(mailOptions);
        if (!isSent) {
            throw new Error("Email not sent"); // Throw an error if the email is not successfully sent
        }

        res.status(200).json({ error: false, message: "Email sent successfully", data: isAdded }); // Send a success response
    } catch (error) {
        res.status(400).json({ error: true, message: error.message }); // Send an error response with the error message
    }
};



const SendMobileVefication = async (req, res) => {
    try {
        // Extract the mobile number from the request parameters
        const { number } = req.params;
        const otp = crypto.randomInt(1000, 9999);

        const optData = {
            user: "Houdact",
            password: "912be393a7XX",
            senderid: "HOTLIO",
            mobiles: `+91${number}`, // Removed space after '+'
            sms: `${otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone @www.hoteliorooms.com # (otp)`,
        }

        const queryString = Object.keys(optData)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(optData[key])}`)
            .join("&");

        const response = await axios.get('http://sms.whistle.mobi/sendsms.jsp?' + queryString);

        if (response.status !== 200) {
            return res.status(400).json({ error: true, message: "OTP failed! Please try again." });
        }

        const isStored = await new VerificationModel({
            verificationType: "Mobile",
            verificationOtp: otp,
            OtpExpireTime: Date.now() + 300000, // 5 minutes timer (300,000 milliseconds)
            sendedTo: number
        }).save()

        if (!isStored) {
            return res.status(400).json({ error: true, message: "OTP Not sent" });
        }

        // Return a success response
        res.status(200).json({ error: false, response: isStored._id, message: "OTP sent successfully" });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }
}



const verifyEmailOtp = async (req, res) => {
    try {
        const otpReqId = req.params.id;

        // Data from the request body
        const { otp } = req.body;

        // Find the OTP request
        const isReq = await VerificationModel.findOne({ _id: otpReqId, OtpExpireTime: { $gt: new Date(Date.now()) } });
        if (!isReq) {
            return res.status(400).json({ error: true, message: "Otp Expired" });
        }

        // Check if the OTP matches
        if (isReq.verificationOtp !== otp) {
            return res.status(404).json({ error: true, message: "Invalid OTP" });
        }

        // OTP verification successful
        await isReq.remove(); // Remove the OTP request from the database

        return res.status(200).json({ error: false, message: "OTP Verified" });
    } catch (error) {
        console.error("Error occurred during OTP verification:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};


// verify the mobile otp req 

const verifyMobileOtp = async (req, res) => {

    // id from params 
    const OtpReqId = req.params.id;
    // otp in body
    const { otp } = req.body;

    try {
        // find the opt req
        const isReq = await VerificationModel.findOne({ _id: OtpReqId, OtpExpireTime: { $gt: new Date(Date.now()) } })
        if (!isReq) return res.status(400).json({ error: true, message: "Otp Expired" })

        if (isReq.verificationOtp !== otp) return res.status(404).json({ error: true, message: "Otp Not Matched" })

        await isReq.remove();
        res.status(200).json({ error: false, message: "Otp Verified Successfully" })

        // check the 

    } catch (error) {
        console.error("Error occurred during OTP verification:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}



module.exports = { SendEmailVerify, SendMobileVefication, verifyEmailOtp, verifyMobileOtp }
