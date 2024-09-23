const AdminModel = require("../../Model/AdminModel/adminModel");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");

const saveFcmToken = async (req, res) => {
  const { userId, fcmToken, role } = req.body;

  if (!userId || !fcmToken || !role) {
    return res.status(400).json({
      error: true,
      message: "User ID, FCM token, and role are required",
    });
  }

  let Model;

  switch (role.toLowerCase()) {
    case "vendor":
      Model = VendorModel;
      break;
    case "admin":
      Model = AdminModel;
      break;
    case "customer":
      Model = CustomerAuthModel;
      break;
    default:
      return res
        .status(400)
        .json({ error: true, message: "Invalid role provided" });
  }

  try {
    const user = await Model.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.status(200).json({
      error: false,
      message: "FCM token saved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { saveFcmToken };
