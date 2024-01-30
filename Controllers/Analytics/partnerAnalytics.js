const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");

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
          totalActiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalApprovedAndActive: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$status", true] },
                    { $eq: ["$isAdminApproved", true] },
                  ],
                },
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
          totalActiveHotel: "$totalActiveHotel",
          totalApprovedAndActive: "$totalApprovedAndActive",
        },
      },
    ]);

    res
      .status(200)
      .json({ error: false, message: "success", data: response[0] });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DashboardCountings = async (req, res) => {
  const { vendorid } = req.params;
  const currentDate = new Date();
  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      {
        $lookup: {
          from: "hotels",
          foreignField: "_id",
          localField: "hotels",
          pipeline: [
            {
              $lookup: {
                from: "room-configs",
                foreignField: "_id",
                localField: "rooms.roomConfig",
                pipeline: [
                  {
                    $group: {
                      _id: "$will",
                      total: { $sum: "$rooms" },
                    },
                  },
                ],
                as: "roomConfig",
              },
            },
            // Yha se project krna hai hotel ke room count se increased or decreased count minus krke

            {
              $project: {
                $map: {
                  input: "$rooms",
                  as: "roomsArray",
                  in :{
                    $cond :{
                      if: ""
                    }
                  }
                },
              },
            },
          ],
          as: "hotels",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "hotels._id",
          foreignField: "hotel",
          as: "bookingList",
        },
      },

      {
        $project: {
          totalRooms: {
            $sum: {
              $map: {
                input: "$hotels",
                as: "hotelData",
                in: { $sum: "$$hotelData.rooms.counts" },
              },
            },
          },
          hotels: 1,
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { PartnerHotelsInfo, DashboardCountings };
