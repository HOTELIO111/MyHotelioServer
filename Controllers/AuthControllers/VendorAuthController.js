const VendorModel = require("../../Model/HotelModel/VendorModel");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption");
const { isEmail, isMobileNumber } = require("../utils");
require("dotenv").config();
const jwt = require('jsonwebtoken')



const AddVendor = async (req, res) => {
    const formData = req.body

    // check the user is already present or not
    const isUser = await VendorModel.findOne({ partnerEmail: req.body.partnerEmail })
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
    const isLoginwith = isMobileNumber(req.body.partnerEmail) === true ? "mobileNo" : isEmail(req.body.partnerEmail) === true ? "partnerEmail" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.partnerEmail }

    try {
        const result = await VendorModel.findOne(credential)
        if (!result) return res.status(404).json({ error: true, message: "No User Found" })
        const { passsword, ...rest } = result
        // ver
        // compare the password  
        // const isPasswordCorrect = bcrypt.compare(req.body.password, result.password)
        const isPasswordCorrect = comparePassword(req.body.password, result.password, result.secretKey)
        if (!isPasswordCorrect) return res.status(400).json({ error: true, message: "Password is Incorrect" })

        const accesstoken = jwt.sign(rest, process.env.SECRET_CODE)
        res.header("access-token", accesstoken)
        res.status(200).json({ error: false, data: result })

    } catch (error) {
        res.status(500).json(error)
    }
}



module.exports = { AddVendor, VendorLogin }