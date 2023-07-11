// Import necessary modules
const crypto = require('crypto');
const twilio = require('twilio');
require('dotenv').config();
const OtpModel = require("../../Model/other/OtpVerifyModel")

// Create a Twilio client instance
const accountSid = 'ACe150d0d218b5f6abaffdb62567b7f14b';
const authToken = 'cbf8353328c2f5495901cdbd34a365ef';
const twilioClient = twilio(accountSid, authToken);

// Send OTP function
const SendOtp = async (req, res) => {
    try {
        // Extract the mobile number from the request parameters
        const { number } = req.params;
        let otp;
        // check the number have already registered otp or not 
        const isOtp = await OtpModel.findOne({ numberVerified: number })
        if (isOtp) {
            otp = isOtp.otp
        } else {
            otp = crypto.randomInt(1000, 9999);
        }
        // Generate a random OTP

        // Send the OTP via Twilio
        const message = await twilioClient.messages.create({
            body: `This is an OTP message from Hotelio. Your OTP is ${otp}`,
            from: '+16509101714',
            to: `+91${number}`
        });

        const isStored = await new OtpModel({
            otpKey: message.sid,
            otp: otp,
            otpExpiresTime: Date.now() + 59999, // 59 sec timer  
            numberVerified: number
        }).save()

        if (!isStored) {
            res.status(400).json({ error: true, message: "Opt Not sent" })
            isStored.remove()
        }

        // Return a success response
        res.status(200).json({ error: false, response: message.sid });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }
};



const VerifyOptFormDb = async (req, res) => {
    try {
        // Get the OTP key from the request parameters
        const key = req.params.key;
        // Get the OTP value from the request parameters
        const otp = req.params.otp;

        // Find the OTP request with the given key and check if it's not expired
        const isReq = await OtpModel.findOne({
            otpKey: key,
            otpExpiresTime: { $gt: new Date(Date.now()) },
        });

        // If no OTP request is found, return a 404 error
        if (!isReq) {
            return res
                .status(404)
                .json({ error: true, message: "Otp Expired " });
        }

        // If the OTP value doesn't match the stored OTP, return a 404 error
        if (isReq.otp !== otp) {
            return res
                .status(404)
                .json({ error: true, message: "OTP Not Matched" });
        }

        // If the OTP is verified successfully, return a success message
        res.status(200).json({ error: false, message: "Verified Successfully" });
    } catch (error) {
        // If any error occurs during the process, return a 500 error
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// Export the function
module.exports = { VerifyOptFormDb, SendOtp }

