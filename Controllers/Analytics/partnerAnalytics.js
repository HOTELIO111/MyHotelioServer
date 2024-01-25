const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");

const PartnerHotelsInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await HotelModel.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "hotelAnalytics",
          totalHotels: { $sum: 1 },
          totalApprovedHotels: {
            $sum: {
              $cond: {
                if: { $eq: ["$isAdminApproved", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalInactiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", false] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalHotels: "$totalHotels",
          totalApprovedHotels: "$totalApprovedHotels",
          totalInactiveHotel: "$totalInactiveHotel",
        },
      },
    ]);

    res
      .status(200)
      .json({ error: false, message: "success", date: response[0] });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { PartnerHotelsInfo };
