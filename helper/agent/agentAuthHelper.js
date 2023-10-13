const {
  EncryptPassword,
} = require("../../Controllers/Others/PasswordEncryption");
const AgentModel = require("../../Model/AgentModel/agentModel");
const VerificationModel = require("../../Model/other/VerificationModel");

const CreateAgent = async (formData) => {
  const hashedPassword = EncryptPassword(formData.password);
  try {
    const newAgent = await new AgentModel({
      ...formData,
      password: hashedPassword.hashedPassword,
      secretKey: hashedPassword.salt,
    }).save();

    return { success: true, payload: newAgent };
  } catch (error) {
    console.error("Error creating agent:", error); // Add this line for error debugging
    return {
      success: false,
      error: `Failed to create agent: ${error.message}`,
    };
  }
};

// Check the agent is already registered or not
const AgentAlreadyRegistered = async (formData) => {
  try {
    const response = await AgentModel.findOne({
      $or: [
        { gstNo: formData.gstNo },
        { mobileNo: formData.mobileNo },
        { email: formData.email },
        { panNo: formData.panNo },
      ],
    });

    const matched = [];
    if (response) {
      if (response.gstNo === formData.gstNo)
        matched.push("GST no is already registered");
      if (response.mobileNo === formData.mobileNo)
        matched.push("Mobile No is already Registered");
      if (response.email === formData.email)
        matched.push("Email Is already registered");
      if (response.panNo === formData.panNo)
        matched.push("Pan No is already registered");
    }
    const returnMessage = matched.map((item) => ({ message: item }));
    return { found: true, message: returnMessage };
  } catch (error) {
    return { found: false };
  }
};

const CheckOtpVerify = async (isLoginwith, otp, mobileNo) => {
  let verification;
  // Verify OTP
  if (isLoginwith === "mobileNo") {
    verification = await VerificationModel.findOne({
      verificationType: "Mobile",
      verificationOtp: otp,
      sendedTo: mobileNo,
      OtpExpireTime: { $gt: new Date(Date.now()) },
    });
  } else {
    verification = await VerificationModel.findOne({
      verificationType: "Email",
      verificationOtp: otp,
      sendedTo: mobileNo,
      OtpExpireTime: { $gt: new Date(Date.now()) },
    });
  }
  return verification
};
module.exports = { CreateAgent, AgentAlreadyRegistered, CheckOtpVerify };
