const { response } = require("express");
const VendorModel = require("../../Model/HotelModel/VendorModel");
const SendMail = require("../Others/Mailer");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption");
const { isEmail, isMobileNumber } = require("../utils");
const crypto = require('crypto')
require("dotenv").config();
// const fast2sms = require('fast-two-sms');
const jwt = require('jsonwebtoken');
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const OtpModel = require("../../Model/other/OtpVerifyModel");
const VerificationModel = require("../../Model/other/VerificationModel");



const AddVendor = async (req, res) => {
    const formData = req.body

    // check the user is already present or not
    const isUser = await VendorModel.findOne({ email: req.body.email })
    if (isUser) return res.status(409).json({ error: true, message: "Email Already Registered" })
    // mobile no check
    const isUserWithMobile = await VendorModel.findOne({ mobileNo: req.body.mobileNo })
    if (isUserWithMobile) return res.status(409).json({ error: true, message: "Mobile Number Already Registered" })

    // make the password hashed  
    // make the password as a hash password 
    const hashPassword = EncryptPassword(req.body.password)
    // const salt = await bcrypt.genSalt(10)
    // const hashPassword = await bcrypt.hash(req.body.password, salt)

    try {
        const result = await new VendorModel({
            ...formData,
            password: hashPassword.hashedPassword,
            secretKey: hashPassword.salt
        }).save()
        res.status(200).json({
            error: true,
            data: result
        })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}


const VendorLogin = async (req, res) => {

    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }

    try {
        const result = await VendorModel.findOne(credential)
        if (!result) return res.status(404).json({ error: true, message: "No User Found" })
        const { passsword, ...rest } = result
        // ver
        // compare the password  
        // const isPasswordCorrect = bcrypt.compare(req.body.password, result.password)
        const isPasswordCorrect = comparePassword(req.body.password, result.password, result.secretKey)
        if (!isPasswordCorrect) return res.status(400).json({ error: true, message: "Password is Incorrect" })
        // access token generate and store
        const accesstoken = jwt.sign(rest, process.env.SECRET_CODE)
        res.header("access-token", accesstoken)
        res.status(200).json({ error: false, data: result })

    } catch (error) {
        res.status(500).json(error)
    }
}

// forgot Password  

const VendorForgotPasword = async (req, res) => {


    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }


    // find the user 
    const isUser = await VendorModel.findOne(credential);
    if (!isUser) return res.status(404).json({ error: true, message: "No User Found" })

    // generate the resetlink
    const resetUrl = crypto.randomBytes(20).toString('hex')

    // store the link in the person db
    isUser.resetLink = resetUrl;
    isUser.resetDateExpire = Date.now() + 120000  // resetLink Valid only for 1 hour
    await isUser.save();

    // prepare a mail to send reset mail
    const mailOptions = {
        from: process.env.SENDEREMAIL,
        to: req.body.email,
        subject: 'Reset Password',
        html: EmailForResetLink(isUser.name, `${req.header.origin}/reset-password/${resetUrl}`),
    };

    // send Mail 
    const send = SendMail(mailOptions);
    if (!send) return res.status(400).json("Email Not Sent")

    res.status(200).json("reset email sended successfully")

}





// reset my password 

const VendorResetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;

    // find user with reset Link
    const user = await VendorModel.findOne({
        resetLink: resetLink,
        resetDateExpire: { $gt: new Date(Date.now()) }
    });
    if (!user) return res.status(400).json({ error: true, message: "Invalid or expired token'" });

    try {
        // convert the password in encryptedway
        const hashedPassword = EncryptPassword(newPassword)
        // check the the reset time is expired or not 
        user.password = hashedPassword.hashedPassword;
        user.secretKey = hashedPassword.salt
        user.resetLink = undefined;
        user.resetDateExpire = undefined;
        await user.save();
        res.status(200).json({ error: false, message: "password Changed Successfully" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}

// delete al the user 
const DeleteVendors = async (req, res) => {
    VendorModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "Every thing deleted" })
    }).catch((error) => {
        console.log(error)
    })
}




// const SendOtpForVerify = async (req, res) => {
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
        const otpReqId = req.params.id;
        const cid = req.params.cid;
        const otp = req.params.otp;

        // Data from the request body
        const formData = req.body;

        // Find the OTP request
        const isReq = await VerificationModel.findOne({
            _id: otpReqId,
            OtpExpireTime: { $gt: new Date() },
        });

        if (!isReq) {
            return res.status(400).json({ error: true, message: "OTP Expired" });
        }

        // Check if the OTP matches
        if (isReq.verificationOtp !== otp) {
            return res.status(404).json({ error: true, message: "Invalid OTP" });
        }

        // OTP verification successful

        // Update the data for the vendor
        const isUpdated = await VendorModel.findByIdAndUpdate(
            cid,
            {
                ...formData,
                isEmailVerified: true,
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
        const alldata = await VendorModel.find({})
        if (!alldata) return res.status(404).json({ error: true, message: "No data Found" })
        res.status(200).json({ error: false, data: alldata })
    } catch (error) {
        res.status(500).json({ error })
    }
}



module.exports = { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword, DeleteVendors, GetVendorDataUpdate, GetAllVendor }