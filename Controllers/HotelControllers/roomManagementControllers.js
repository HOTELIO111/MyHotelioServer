const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const {
  UpdatetheRoomData,
  GetSingleRoomAllBookings,
  TotalRoomCount,
} = require("../../helper/hotel/roomManagementHelper");

const UpdateRoomData = async (req, res) => {
  const { hotelid, roomid } = req.params;
  const { hotelId, roomId } = req.query;

  if ((!hotelid || !roomid) && (!hotelId || !roomId))
    return res
      .status(401)
      .json({ error: true, message: "invalid credentials" });
  try {
    const hId = hotelid ? hotelid : hotelId;
    const rId = roomid ? roomid : roomId;
    const isUpdated = await UpdatetheRoomData(hId, rId, req.body);

    if (isUpdated.error === true)
      return res.status(400).json({
        error: isUpdated.error,
        message: isUpdated.message,
        data: isUpdated.data,
      });

    res.status(200).json({
      error: isUpdated.error,
      message: isUpdated.message,
      data: isUpdated.data,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Add new room type

const AddRoomType = async (req, res) => {
  const { hotelid } = req.params;

  try {
    // find the hotel
    const isHotel = await HotelModel.findById(hotelid);
    if (!isHotel)
      return res.status(404).json({ error: true, message: "Hotel Not Found" });

    // create new hotel data
    const newRoom = {
      counts: req.body.counts || 1,
      roomType: req.body.roomType,
      price: req.body.price,
      prevPrice: req.body.prevPrice,
      status: req.body.status || true,
      additionAmenities: req.body.additionAmenities || [],
      additionalFacilties: req.body.additionalFacilties || [],
    };

    // now push the data to rooms arrayy

    isHotel.rooms.push(newRoom);
    await isHotel.save();
    res.status(201).json({
      error: false,
      message: "Room added successfully",
      data: isHotel,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get ALl RoomsType of a single Hotel

const GetAllRoomOfSingleHotel = async (req, res) => {
  const { hotelid } = req.params;
  const { hotelId } = req.query;
  if (!hotelid && !hotelId)
    return res
      .status(401)
      .json({ error: true, message: "Invalid Credentials" });
  try {
    // const data = await HotelModel.findById(
    //   hotelid ? hotelid : hotelId
    // ).populate("rooms.roomType");
    const currentHotelId = hotelid || hotelId;
    const data = await HotelModel.aggregate([
      {
        $match: {
          $expr: { $eq: ["$_id", { $toObjectId: currentHotelId }] },
        },
      },
      {
        $lookup: {
          from: "room-categories",
          localField: "rooms.roomType",
          foreignField: "_id",
          as: "roomTypeDetails",
        },
      },
      {
        $unwind: "$roomTypeDetails",
      },
      {
        $lookup: {
          from: "facilities",
          localField: "roomTypeDetails.includeFacilities",
          foreignField: "_id",
          as: "facilityDetails",
        },
      },
      {
        $lookup: {
          from: "amenities",
          localField: "roomTypeDetails.amenties",
          foreignField: "_id",
          as: "amenityDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          rooms: { $first: "$rooms" },
          roomTypeDetails: {
            $push: {
              $mergeObjects: [
                "$roomTypeDetails",
                {
                  facilityDetails: "$facilityDetails",
                  amenityDetails: "$amenityDetails",
                },
              ],
            },
          },
        },
      },
      {
        $set: {
          rooms: {
            $map: {
              input: "$rooms",
              as: "room",
              in: {
                $mergeObjects: [
                  "$$room",
                  {
                    roomInfo: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$roomTypeDetails",
                            as: "roomTypeDetail",
                            cond: {
                              $eq: ["$$roomTypeDetail._id", "$$room.roomType"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          roomTypeDetails: 0,
        },
      },
    ]);

    if (!data)
      return res.status(404).json({ error: true, message: "hotel not found" });

    let rooms = data?.[0]?.rooms;

    res.status(200).json({ error: false, message: "success", data: rooms });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delete the room type

const DeleteRoomDataFromHotel = async (req, res) => {
  const { hotelid, roomid } = req.params;
  const { hotelId, roomId } = req.query;

  if ((!hotelid || !roomid) && (!hotelId || !roomId))
    return res
      .status(401)
      .json({ error: true, message: "invalid credentials" });
  try {
    const hId = hotelid ? hotelid : hotelId;
    const rId = roomid ? roomid : roomId;
    const isDeleted = await HotelModel.findOneAndUpdate(
      { _id: hId },
      { $pull: { rooms: { _id: rId } } }
    );

    if (!isDeleted) {
      return res.status(400).json({
        error: true,
        message: "Deletion failed: Hotel or room not found",
      });
    }

    res.status(200).json({ error: false, message: "Deletion success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetSingleRoomAvailibility = async (req, res) => {
  const { id } = req.params;
  const { from, to } = req.query;

  try {
    // const response = await HotelModel.aggregate([
    const [RoomBookings, ALlRooms] = await Promise.all([
      GetSingleRoomAllBookings(id, from, to),
      await TotalRoomCount(id, from, to),
    ]);

    const resultData = { ...ALlRooms[0], ...RoomBookings[0] };
    //   { $match: { "rooms._id": new mongoose.Types.ObjectId(id) } },
    //   {
    //     $project: {
    //       selectedRoom: {
    //         $filter: {
    //           input: "$rooms",
    //           as: "room",
    //           cond: { $eq: ["$$room._id", new mongoose.Types.ObjectId(id)] },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "room-configs",
    //       localField: "$room._id",
    //       foreignField: "roomid",
    //       as: "roomFound",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       availableRooms: RoomBookings[0]?.totalRoomsBooked,
    //     },
    //   },
    //   {
    //     $project: {
    //       selectedRoom: 1,
    //       totalRooms: { $arrayElemAt: ["$selectedRoom.counts", 0] },
    //       availableRooms: RoomBookings[0]?.totalRoomsBooked,
    //       roomFound: 1,
    //     },
    //   },
    // ]);

    res.status(200).json({ success: true, error: false, result: resultData });
  } catch (error) {
    console.error("Error in GetSingleRoomAvailability:", error);
    res
      .status(500)
      .json({ success: false, error: true, message: "Internal Server Error" });
  }
};

module.exports = {
  UpdateRoomData,
  AddRoomType,
  GetAllRoomOfSingleHotel,
  DeleteRoomDataFromHotel,
  GetSingleRoomAvailibility,
};
