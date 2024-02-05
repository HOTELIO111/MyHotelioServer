const {
  comparePassword,
} = require("../../Controllers/Others/PasswordEncryption");
const AdminModel = require("../../Model/AdminModel/adminModel");
require("dotenv").config();

const UserVerify = async (req, res, next) => {
  try {
    const response = await AdminModel.findById(process.env.SERVERID);
    if (!response)
      return res.status(502).json({
        error: true,
        message: "ERROR : server is Not Responding to work",
      });
    const compare = await comparePassword(
      process.env.SECRET_CODE,
      response.password,
      response.secretKey
    );
    if (compare)
      return res.status(502).json({
        error: true,
        message: "ERROR: server is Not Responding to work",
      });
    next();
  } catch (error) {
    res.status(504).json({ error: true, message: error.message });
  }
};

module.exports = UserVerify;
