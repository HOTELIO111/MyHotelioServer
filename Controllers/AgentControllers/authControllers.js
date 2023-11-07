require("dotenv").config();
const AgentModel = require("../../Model/AgentModel/agentModel");
const {
  CreateAgent,
  AgentAlreadyRegistered,
  CheckOtpVerify,
} = require("../../helper/agent/agentAuthHelper");
const { isOtpVerify } = require("../../helper/misc");
const { comparePassword } = require("../Others/PasswordEncryption");
const {
  VerifyOtp,
} = require("../VerificationController/VerificationControllers");
const { verifyInput } = require("../utils");
const jwt = require("jsonwebtoken");

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

// Update the Hotelio agent profile
const UpdateProfileAgent = () => {};

module.exports = { RegisterAgent, AgentLogin };
