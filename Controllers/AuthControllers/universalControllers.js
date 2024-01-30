const AdminModel = require("../../Model/AdminModel/adminModel");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");

const UploadAvatar = async (req, res) => {
  const userId = req.params.userid;
  const { avatar } = req.body;

  try {
    const [vendor, admin, customer] = await Promise.all([
      VendorModel.findById(userId),
      AdminModel.findById(userId),
      CustomerAuthModel.findById(userId),
    ]);

    let userToUpdate;

    if (vendor) {
      userToUpdate = vendor;
    } else if (admin) {
      userToUpdate = admin;
    } else if (customer) {
      userToUpdate = customer;
    } else {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    userToUpdate.avatar = avatar;
    await userToUpdate.save();

    return res.status(200).json({
      error: false,
      message: "Avatar uploaded successfully",
      data: userToUpdate,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
};

module.exports = { UploadAvatar };
