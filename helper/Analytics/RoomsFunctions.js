const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");

const RoomDataAsPerRoom = async (
  hotelid,
  checkIn = new Date(),
  checkOut = new Date()
) => {
  try {
    const _response = await HotelModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(hotelid) } },
      {
        $lookup: {
          from: "room-configs",
          localField: "rooms.roomConfig",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                $or: [
                  {
                    $and: [
                      { from: { $gte: new Date(checkIn) } },
                      { from: { $lte: new Date(checkOut) } },
                    ],
                  },
                  {
                    $and: [
                      { to: { $gte: new Date(checkIn) } },
                      { to: { $lte: new Date(checkOut) } },
                    ],
                  },
                ],
              },
            },
            // Yha pe Room Calculation baki hai wo kro uske baad booking ka caculated nikalo then sab ok hai
          ],
          as: "roomCountData",
        },
      },
    ]);

    return { error: false, message: "success", data: _response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

module.exports = { RoomDataAsPerRoom };
