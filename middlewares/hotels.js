const HotelModel = require("../Model/HotelModel/hotelModel");

const HotelModifyStatus = async (req, res, next) => {
  const { id, status } = req.params;
  try {
    const response = await HotelModel.updateMany(
      { vendorId: id },
      { status: status },
      { new: true }
    );
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "failed to update hotel" });
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { HotelModifyStatus };
