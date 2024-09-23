const AdminModel = require("../../Model/AdminModel/adminModel");
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const SendMail = require("../Others/Mailer");
require('dotenv').config()
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption");
const { isMobileNumber, isEmail } = require("../utils");
const jwt = require('jsonwebtoken');



const GetAddTheAdmin = async (req, res) => {
    // check if the admin is registered 
    const isAdmin = await AdminModel.findOne({})
    if (isAdmin) return res.status(409).json({ error: true, message: "Admin Is Already Registerd" })

    const hashedPassword = EncryptPassword(req.body.password)

    try {
        const result = await new AdminModel(
            {
                ...req.body,
                role: "admin",
                password: hashedPassword.hashedPassword,
                secretKey: hashedPassword.salt
            }
        ).save()
        if (!result) return res.status(400).json({ error: true, message: "Not Registered" })
        res.status(200).json({ error: false, data: result })
    } catch (error) {
        res.status(500).json(error)
    }
}


// Login Api 
const AdminLoginApi = async (req, res) => {
    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }


    // check the suser is exsist or not 
    const isUser = await AdminModel.findOne(credential)
    if (!isUser) return res.status(404).json({ error: true, message: "No User Found" })
    const { password, ...rest } = isUser


    // compare password 
    const isMatched = comparePassword(req.body.password, isUser.password, isUser.secretKey)
    if (!isMatched) return res.status(400).json({ error: true, message: "Password Incorrect" });

    // generate token 
    const acessToken = jwt.sign(rest, process.env.SECRET_CODE)
    req.header('Authorization', `Bearer ${acessToken}`);
    res.status(200).json({ error: false, data: isUser, token: acessToken })

}



// Update the Admin 

const UpdateAdmin = async (req, res) => {
    const formdata = req.body;
    const id = req.params.id

    try {
        const Update = await AdminModel.findByIdAndUpdate(id, formdata, { new: true })
        if (!Update) return res.status(400).json({ error: true, message: "Not Updated" })

        // return the update response 
        res.status(200).json({ error: false, data: Update })
    } catch (error) {
        res.status(500).json(error)
    }
}



// forgot Password  

const AdminForgotPassword = async (req, res) => {


    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }


    // find the user 
    const isUser = await AdminModel.findOne(credential);
    if (!isUser) return res.status(404).json({ error: true, message: "No User Found" })

    // generate the resetlink
    const resetUrl = crypto.randomBytes(20).toString('hex')

    // store the link in the person db
    isUser.resetLink = resetUrl;
    isUser.resetDateExpires = Date.now() + 120000  // resetLink Valid only for 1 hour
    await isUser.save();

    // prepare a mail to send reset mail
    const mailOptions = {
        from: process.env.SENDEREMAIL,
        to: req.body.email,
        subject: 'Reset Password',
        html: EmailForResetLink(isUser.name, `${req.header.origin}/reset-password/${resetUrl}`)
    };

    // send Mail 
    const send = SendMail(mailOptions);
    if (!send) return res.status(400).json("Email Not Sent")

    res.status(200).json("reset email sended successfully")

}





// reset my password 

const AdminResetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;

    // find user with reset Link
    const user = await AdminModel.findOne({
        resetLink: resetLink,
        resetDateExpires: { $gt: new Date(Date.now()) }
    });
    if (!user) return res.status(400).json({ error: true, message: "Invalid or expired token'" });

    try {
        // convert the password in encryptedway
        const hashedPassword = EncryptPassword(newPassword)
        // check the the reset time is expired or not 
        user.password = hashedPassword.hashedPassword;
        user.secretKey = hashedPassword.salt
        user.resetLink = undefined;
        user.resetDateExpires = undefined;
        await user.save();
        res.status(200).json({ error: false, message: "password Changed Successfully" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}





module.exports = { GetAddTheAdmin, AdminLoginApi, UpdateAdmin, AdminForgotPassword, AdminResetPassword }