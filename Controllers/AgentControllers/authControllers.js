require("dotenv").config();
const AgentModel = require("../../Model/AgentModel/agentModel");
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const {
  CreateAgent,
  AgentAlreadyRegistered,
  CheckOtpVerify,
} = require("../../helper/agent/agentAuthHelper");
const { isOtpVerify } = require("../../helper/misc");
const SendMail = require("../Others/Mailer");
const {
  comparePassword,
  EncryptPassword,
} = require("../Others/PasswordEncryption");
const {
  VerifyOtp,
} = require("../VerificationController/VerificationControllers");
const { verifyInput } = require("../utils");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const RegisterAgent = async (req, res) => {
  const data = req.body;
  try {
    const isReg = await CreateAgent(data);
    if (isReg.success === false)
      return res.status(400).json({
        error: true,
        message: isReg.error,
      });
    res
      .status(200)
      .json({ error: false, message: "success", data: isReg.payload });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Login Agent
const AgentLogin = async (req, res) => {
  const { mobileNo, otp, password } = req.query;

  if (!mobileNo || (!otp && !password)) {
    return res
      .status(401)
      .json({ error: true, message: "Credentials are missing" });
  }
  try {
    const isInput = verifyInput(mobileNo);
    const user = await AgentModel.findOne({ [isInput]: mobileNo });
    if (!user)
      return res
        .status(404)
        .json({ error: true, message: `No user Found with this ${isInput}` });
    let isOtpVerified;
    if (otp) {
      isOtpVerified = await CheckOtpVerify(isInput, otp, mobileNo);
    }

    let isPasswordValid;
    if (password) {
      isPasswordValid = comparePassword(
        password,
        user.password,
        user.secretKey
      );
    }

    if (!isOtpVerified && !isPasswordValid)
      return res
        .status(400)
        .json({ error: true, message: "invalid password or otp" });

    const JwtData = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(JwtData, process.env.SECRET_CODE);

    // If login is successful, you can respond with a success message
    res
      .setHeader("Authorization", "Bearer " + token)
      .status(200)
      .json({
        error: false,
        message: "Login successful",
        data: user,
        token: token,
      });
  } catch (error) {
    // If an error occurs during the login process, handle it here
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateAgentProfile = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await AgentModel.findByIdAndUpdate(id, formdata, {
      new: true,
    });
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "missing required data" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteAgentProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await AgentModel.findByIdAndDelete(id);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// forgot Password

const ForgotPasswordAgent = async (req, res) => {
  try {
    const { email } = req.params;

    // Check if the user is registered with the provided email
    const user = await AgentModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "No user found with this email" });
    }

    // Generate a unique reset link
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Store the reset link and expiration date in the user's record
    user.resetLink = resetToken;
    user.resetDateExpires = Date.now() + 3600000; // Reset link valid for 1 hour
    await user.save();

    // Prepare email content for sending the reset link
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset",
      html: EmailForResetLink(
        user.name,
        `${req.headers.origin}/reset-password/${resetToken}`
      ),
    };

    // Send the reset email
    await SendMail(mailOptions);

    res.status(200).json("Reset email sent successfully");
  } catch (error) {
    console.error("Error in forgot password agent:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

// reset my password

const ResetPassword = async (req, res) => {
  const { resetLink, newPassword } = req.body;

  // find user with reset Link
  const user = await AgentModel.findOne({
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

module.exports = {
  RegisterAgent,
  AgentLogin,
  DeleteAgentProfile,
  UpdateAgentProfile,
  ForgotPasswordAgent,
  ResetPassword,
};
