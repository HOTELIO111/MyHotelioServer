const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");

const UpdatetheRoomData = async (id, roomid, formdata) => {
  try {
    const updatedData = formdata;
    // Construct an object to update each field separately
    const updateFields = {};
    for (const key in updatedData) {
      updateFields[`rooms.$.${key}`] = updatedData[key];
    }

    // Use updateFields object to update multiple fields
    const isuser = await HotelModel.updateOne(
      { _id: id, "rooms._id": roomid },
      { $set: updateFields }
    );
    if (!isuser.modifiedCount >= 1)
      return { error: true, message: "updation failed ", data: isuser };

    return { error: false, message: "success", data: isuser };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetSingleRoomAllBookings = async (
  roomid,
  checkIn = "2023-12-09T12:00:00.000Z",
  checkOut = "2023-12-15T12:00:00.000Z"
) => {
  try {
    const response = await Booking.aggregate([
      {
        $match: {
          room: roomid,
          bookingStatus: "confirmed",
          $or: [
            {
              "bookingDate.checkIn": {
                $gte: new Date(checkIn),
                $lte: new Date(checkOut),
              },
            },
            {
              "bookingDate.checkOut": {
                $gte: new Date(checkIn),
                $lte: new Date(checkOut),
              },
            },
            {
              $and: [
                { "bookingDate.checkIn": { $lte: new Date(checkIn) } },
                { "bookingDate.checkOut": { $gte: new Date(checkOut) } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: "$_id",
          totalRoomsBooked: { $sum: "$numberOfRooms" },
        },
      },
    ]);

    return response;
  } catch (error) {
    return error;
  }
};

const TotalRoomCount = async (
  roomid,
  checkIn = "2023-01-01T12:00:00Z",
  checkOut = "2023-01-01T14:00:00Z"
) => {
  try {
    // const response = await HotelModel.find({ "rooms._id": roomid });
    const response = await HotelModel.aggregate([
      { $match: { "rooms._id": new mongoose.Types.ObjectId(roomid) } },
      {
        $lookup: {
          from: "room-configs",
          localField: "rooms._id",
          foreignField: "roomid",
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
            {
              $group: {
                _id: "$will",
                roomid: { $first: "$roomid" },
                totalRooms: { $sum: "$rooms" },
              },
            },
          ],
          as: "roomconfig",
        },
      },
      {
        $addFields: {
          totalRooms: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$rooms",
                  as: "room",
                  cond: {
                    $eq: ["$$room._id", new mongoose.Types.ObjectId(roomid)],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          NetTotalRooms: "$totalRooms.counts",
          decreasedRoom: {
            $let: {
              vars: {
                filteredRoom: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$roomconfig",
                        as: "roominfo",
                        cond: { $eq: ["$$roominfo._id", "dec"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$filteredRoom.totalRooms", // Assuming 'value' is the field you want to return
            },
          },
          increasedRoom: {
            $let: {
              vars: {
                filteredRoom: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$roomconfig",
                        as: "roominfo",
                        cond: { $eq: ["$$roominfo._id", "inc"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: "$$filteredRoom.totalRooms", // Assuming 'value' is the field you want to return
            },
          },
        },
      },
    ]);

    return response;
  } catch (error) {
    return error;
  }
};

// $filter: {
//   input: "$roomconfig",
//   as: "roominfo",
//   cond: { $eq: ["$$roominfo._id", "dec"] },
// },

// const CaculateTheRooms = (data) => {
//   console.log(data);
//   let decRooms;
//   let incRooms;
//   data?.forEach((element) => {
//     if (element?.will === "dec") {
//       decRooms = decRooms + element?.rooms;
//     } else {
//       incRooms = incRooms + element?.rooms;
//     }
//   });
//   return { decRooms, incRooms };
// };

module.exports = {
  UpdatetheRoomData,
  GetSingleRoomAllBookings,
  TotalRoomCount,
};
// const response = await Booking.aggregate([
//   {
//     $match: {
//       room: roomid,
//       bookingStatus: "confirmed",
//       $and: [
//         { "bookingDate.checkIn": { $lte: checkOut } },
//         { "bookingDate.checkOut": { $gte: checkIn } },
//       ],
//     },
//   },
// ]);

// let: {
//   var: {
//     decRoomCount: {
//       $cond: {
//         if: { $eq: ["$roomconfig._id", "dec"] },
//         then: "$$roomconfig.totalRooms",
//         else: 0,
//       },
//     },
//     incRoomCount: {
//       $cond: {
//         if: { $eq: ["$roomconfig._id", "inc"] },
//         then: "$$roomconfig.totalRooms",
//         else: 0,
//       },
//     },
//   },
//   in: { $add: ["$decRoomCount", "$incRoomCount"] },
// },
