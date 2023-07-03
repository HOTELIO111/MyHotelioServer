const { SingupValidate, LoginValidate } = require("../../validate");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption")
const CustomerAuthModel = require("../../Model/CustomerModels/CustomerAuthModel")
const bycrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { isMobileNumber, isEmail } = require("../utils");
require('dotenv').config();
const crypto = require('crypto');
const SendMail = require("../Others/Mailer");



// signup 
const SignupUser = async (req, res) => {

    try {
        // lets validate the data
        const { error, value } = SingupValidate(req.body);
        if (error) return res.status(400).json(error.details[0].message);


        // username email resgistered or not check
        const isUserFound = await CustomerAuthModel.findOne({ email: req.body.email })
        if (isUserFound) return res.status(409).json("Email Already Registered")

        // check the mobile no is registered or not 
        const isMobile = await CustomerAuthModel.findOne({ email: req.body.email })
        if (isMobile) return res.status(409).json("Mobile No Already Registered")

        // // make the password as a hash password 
        // const salt = await bycrypt.genSalt(10)
        // const hashPassword = await bycrypt.hash(req.body.password, salt)
        const hashPassword = EncryptPassword(req.body.password)

        // my formdata
        const formdata = new CustomerAuthModel({
            ...req.body,
            password: hashPassword.hashedPassword,
            secretKey: hashPassword.salt
        })

        const saveData = await formdata.save()
        res.status(200).json(saveData);

    } catch (error) {
        res.status(500).json(error)
    }
}



// Login Controller 
const LoginUser = async (req, res) => {

    try {
        // validate the data  
        const { error, value } = LoginValidate(req.body);
        if (error) return res.status(400).json(error.details[0].message)



        // check the user is login with email or Number 
        const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
        if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

        const credential = { [isLoginwith]: req.body.email }


        // find the user 
        const User = await CustomerAuthModel.findOne(credential);
        if (!User) return res.status(404).json({ message: "User Not Found" });
        const { password, ...rest } = User

        // compare the password 
        const compare = comparePassword(req.body.password, User.password, User.secretKey)
        // const compare = bycrypt.compare(req.body.password, User.password)
        if (!compare) return res.status(404).json({ message: "Password Incorrect" })

        //  jenerate the jwt token  
        const token = jwt.sign(rest, process.env.SECRET_CODE)
        res.header("access-token", token)
        res.status(200).json(User)
    } catch (error) {
        res.status(500).json(error)
    }

}

// forgot Password  

const ForgotPassword = async (req, res) => {

    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }

    // find the user 
    const isUser = await CustomerAuthModel.findOne(credential);
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
        text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${req.headers.origin}/reset-password/${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // send Mail 
    const send = SendMail(mailOptions);
    if (!send) return res.status(400).json("Email Not Sent")

    res.status(200).json("reset email sended successfully")

}





// reset my password 

const ResetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;

    // find user with reset Link
    const user = await CustomerAuthModel.findOne({
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


module.exports = { SignupUser, LoginUser, ForgotPassword, ResetPassword }