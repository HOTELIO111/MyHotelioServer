const VendorModel = require("../../Model/HotelModel/vendorModel");
const SendMail = require("../Others/Mailer");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption");
const { isEmail, isMobileNumber } = require("../utils");
const crypto = require('crypto')
require("dotenv").config();
// const fast2sms = require('fast-two-sms');
const jwt = require('jsonwebtoken');
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");
const { DeleteTheSingleVendor, DeleteAllVendor, VendorPasswordUpdate } = require("../../helper/vendor/vendorhelpers");
const { isOtpVerify } = require("../../helper/misc");
const HotelModel = require("../../Model/HotelModel/hotelModel");



const AddVendor = async (req, res) => {
    const formData = req.body

    // check the user is already present or not
    const isUser = await VendorModel.findOne({ email: req.body.email })
    if (isUser) return res.status(409).json({ error: true, message: "Email Already Registered" })
    // mobile no check
    const isUserWithMobile = await VendorModel.findOne({ mobileNo: req.body.mobileNo })
    if (isUserWithMobile) return res.status(409).json({ error: true, message: "Mobile Number Already Registered" })

    // make the password as a hash password 
    const hashPassword = EncryptPassword(req.body.password)

    try {
        const result = await new VendorModel({
            ...formData,
            password: hashPassword.hashedPassword,
            secretKey: hashPassword.salt
        }).save()
        res.status(200).json({
            error: false,
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
        // compare the password 
        const isPasswordCorrect = comparePassword(req.body.password, result.password, result.secretKey)
        if (!isPasswordCorrect) return res.status(400).json({ error: true, message: "Password is Incorrect" })
        // access token generate and store
        const jwtTokenValue = {
            _id: result._id,
            name: result.name,
        }
        const accesstoken = jwt.sign(jwtTokenValue, process.env.SECRET_CODE)
        res.header('Authorization', `Bearer ${accesstoken}`);
        res.status(200).json({ error: false, data: result, token: accesstoken })

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
    try {
        const isDeleted = await DeleteAllVendor()
        if (!isDeleted) return res.status(404).json({ error: true, message: "faild to delete ! try agian " })

        res.status(200).json({ error: false, message: "success" })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }


    // VendorModel.deleteMany({}).then(() => {
    //     res.status(200).json({ error: false, message: "Every thing deleted" })
    // }).catch((error) => {
    //     console.log(error)
    // })
}

// make kyc request  
const RequestKyc = async (req, res) => {
    const { name, email, aadharNo, panNo, aadharImg, panImg } = req.body
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
        const verifiedWith = isReq.verificationType === 'Mobile' ? 'isNumberVarified' : 'isEmailVerified'

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

        console.log()

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

const GetVendorUpdate = async (req, res) => {
    const { id } = req.params;
    const formData = req.body;


    try {
        const response = await VendorModel.findByIdAndUpdate(id, formData, { new: true })
        if (!response) return (400).json({ error: true, message: 'update failed try again' })

        res.status(200).json({ error: false, message: 'success', data: response })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


const DeleteVendorById = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await DeleteTheSingleVendor(id)
        if (!response) return res.status(404).json({ error: true, message: "user not found" })

        res.status(200).json({ error: false, message: "deleted succesfully" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



// Get Vendor by id

const GetVendorById = async (req, res) => {
    const { id } = req.params

    try {
        const user = await VendorModel.findById(id)
        if (!user) return res.status(204).json({ error: true, message: "no user found" })
        res.status(200).json({ error: false, message: "success", data: user })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



// Get pasword Update of the vendor 

const GetVendorPasswordUpdate = async (req, res) => {
    const { otpid, otp } = req.query;
    const { email, password } = req.body;


    if (!otpid && !otp && !email && !password) return res.status(400).json({ error: true, message: "Please Check the parameters" })
    try {

        // check the otp varification 
        const isVerified = await isOtpVerify(otp, otpid)
        if (isVerified.error === true) return res.status(400).json(isVerified)

        // update the password 
        const updatePassword = await VendorPasswordUpdate(email, password)
        res.status(updatePassword.status).json({ error: updatePassword.error, message: updatePassword.message })
    } catch (error) {

    }
}







module.exports = { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword, DeleteVendors, GetVendorDataUpdate, GetAllVendor, GetVendorUpdate, DeleteVendorById, GetVendorById, GetVendorPasswordUpdate }