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
    let response = await Booking.aggregate([
      {
        $match: {
          room: roomid,
          bookingStatus: { $in: ["confirmed", "pending"] },
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
          _id: "$room",
          totalRoomsBooked: { $sum: "$numberOfRooms" },
        },
      },
    ]);
    if (response.length === 0) {
      response = [{ totalRoomsBooked: 0 }];
    }

    return response;
  } catch (error) {
    return error;
  }
};

const TotalRoomCount = async (
  roomid,
  checkIn = new Date("1970-01-01T00:00:00Z"),
  checkOut = new Date("2100-01-01T23:59:59Z")
) => {
  try {
    // const responseold = await HotelModel.find({ "rooms._id": roomid });
    const roomObjectId = new mongoose.Types.ObjectId(roomid);
    const response = await HotelModel.aggregate([
      {
        $match: {
          "rooms._id": new mongoose.Types.ObjectId(roomid),
        },
      },
      {
        $lookup: {
          from: "room-configs",
          localField: "rooms._id",
          foreignField: "roomid",
          pipeline: [
            {
              $match: {
                roomid: new mongoose.Types.ObjectId(roomid),
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
          TotalRooms: {
            $ifNull: ["$totalRooms.counts", 0],
          },
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
              in: {
                $ifNull: ["$$filteredRoom.totalRooms", 0],
              },
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
              in: {
                $ifNull: ["$$filteredRoom.totalRooms", 0],
              },
            },
          },
        },
      },
    ]);

    // const testingReponse = await HotelModel.aggregate([
    //   {
    //     $unwind: "$rooms",
    //   },
    //   {
    //     $match: {
    //       "rooms._id": roomObjectId,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "room-configs",
    //       localField: "rooms._id",
    //       foreignField: "roomid",
    //       pipeline: [
    //         {
    //           $match: {
    //             roomid: roomObjectId,
    //             $or: [
    //               {
    //                 $and: [
    //                   { from: { $gte: new Date(checkIn) } },
    //                   { from: { $lte: new Date(checkOut) } },
    //                 ],
    //               },
    //               {
    //                 $and: [
    //                   { to: { $gte: new Date(checkIn) } },
    //                   { to: { $lte: new Date(checkOut) } },
    //                 ],
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: "$will",
    //             roomid: { $first: "$roomid" },
    //             totalRooms: { $sum: "$rooms" },
    //           },
    //         },
    //       ],
    //       as: "roomconfig",
    //     },
    //   },
    // ]);

    // console.log(testingReponse);

    // const CompleteReponse = await HotelModel.aggregate([
    //   {
    //     $unwind: "$rooms",
    //   },
    //   {
    //     $match: {
    //       "rooms._id": roomObjectId,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "room-configs",
    //       localField: "rooms._id",
    //       foreignField: "roomid",
    //       pipeline: [
    //         {
    //           $match: {
    //             roomid: roomObjectId,
    //             $or: [
    //               {
    //                 $and: [
    //                   { from: { $gte: new Date(checkIn) } },
    //                   { from: { $lte: new Date(checkOut) } },
    //                 ],
    //               },
    //               {
    //                 $and: [
    //                   { to: { $gte: new Date(checkIn) } },
    //                   { to: { $lte: new Date(checkOut) } },
    //                 ],
    //               },
    //             ],
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: "$will",
    //             roomid: { $first: "$roomid" },
    //             totalRooms: { $sum: "$rooms" },
    //           },
    //         },
    //       ],
    //       as: "roomconfig",
    //     },
    //   },
    //   { $unwind: "$roomconfig" },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       totalRooms: { $sum: "$roomconfig.totalRooms" },
    //       decreasedRooms: {
    //         $sum: {
    //           $cond: [
    //             { $eq: ["$roomconfig._id", "dec"] },
    //             "$roomconfig.totalRooms",
    //             0,
    //           ],
    //         },
    //       },
    //       increasedRooms: {
    //         $sum: {
    //           $cond: [
    //             { $eq: ["$roomconfig._id", "inc"] },
    //             "$roomconfig.totalRooms",
    //             0,
    //           ],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       totalRooms: { $ifNull: ["$totalRooms", 0] },
    //       decreasedRooms: { $ifNull: ["$decreasedRooms", 0] },
    //       increasedRooms: { $ifNull: ["$increasedRooms", 0] },
    //     },
    //   },
    //   // {
    //   //   $addFields: {
    //   //     totalRooms: {
    //   //       $arrayElemAt: [
    //   //         {
    //   //           $filter: {
    //   //             input: "$roomConfig",
    //   //             as: "roominfo",
    //   //             cond: {
    //   //               $eq: ["$$roominfo._id", "dec"],
    //   //             },
    //   //           },
    //   //         },
    //   //         0,
    //   //       ],
    //   //     },
    //   //     increasedRoom: {
    //   //       $arrayElemAt: [
    //   //         {
    //   //           $filter: {
    //   //             input: "$roomconfig",
    //   //             as: "roominfo",
    //   //             cond: { $eq: ["$$roominfo._id", "inc"] },
    //   //           },
    //   //         },
    //   //         0,
    //   //       ],
    //   //     },
    //   //   },
    //   // },
    // ]);

    return response;
  } catch (error) {
    return error;
  }
};

const GetTheRoomAvailiabilityStats = async (id, from, to) => {
  try {
    const [RoomBookings, ALlRooms] = await Promise.all([
      GetSingleRoomAllBookings(id, from, to),
      await TotalRoomCount(id, from, to),
    ]);

    const resultData = { ...ALlRooms[0], ...RoomBookings[0] };

    const roomCount = RoomCount(resultData);
    return roomCount;
  } catch (error) {
    return error;
  }
};

const RoomCount = (data) => {
  const TotalRooms = data?.TotalRooms;
  const decreasedRoom = data?.decreasedRoom;
  const increasedRoom = data?.increasedRoom;
  const totalRoomsBooked = data?.totalRoomsBooked;

  let totalCount = TotalRooms;
  if (decreasedRoom) {
    totalCount = totalCount - decreasedRoom;
  }
  if (increasedRoom) {
    totalCount = totalCount + increasedRoom;
  }
  if (totalRoomsBooked) {
    totalCount = totalCount - totalRoomsBooked;
  }
  return totalCount;
};

module.exports = {
  UpdatetheRoomData,
  GetSingleRoomAllBookings,
  TotalRoomCount,
  GetTheRoomAvailiabilityStats,
};
