const { default: mongoose } = require("mongoose");
const RoomConfigModel = require("../../Model/HotelModel/RoomsConfigModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");

const createRoomConfig = async (req, res) => {
  const data = req.body;
  const { hid } = req.params;
  const { rid } = req.params;
  try {
    if (data.will === "dec") {
      const _CheckAvailibility = await RoomConfigModel.aggregate([
        {
          $match: {
            roomid: new mongoose.Types.ObjectId(rid),
            will: data.will,
            $or: [
              {
                $and: [
                  { from: { $gte: new Date(data.from) } },
                  { from: { $lte: new Date(data.to) } },
                ],
              },
              {
                $and: [
                  { to: { $gte: new Date(data.from) } },
                  { to: { $lte: new Date(data.to) } },
                ],
              },
            ],
          },
        },
        {
          $lookup: {
            from: "hotels",
            localField: "roomid",
            foreignField: "rooms._id",
            as: "hotelData",
          },
        },
        {
          $addFields: {
            hotelData: {
              $map: {
                input: "$hotelData",
                as: "hotel",
                in: {
                  rooms: {
                    $filter: {
                      input: "$$hotel.rooms",
                      as: "room",
                      cond: {
                        $eq: ["$$room._id", new mongoose.Types.ObjectId(rid)],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: "$roomid",
            totalRoomsCount: { $sum: "$rooms" },
            hotelData: { $first: "$hotelData.rooms.counts" },
          },
        },
      ]);

      const totalActionsOnroom = _CheckAvailibility[0]?.totalRoomsCount;
      const totalRooms = _CheckAvailibility[0]?.hotelData[0][0];

      if (totalActionsOnroom + data.rooms > totalRooms)
        return res.status(401).json({
          error: true,
          message: `you have already blocked the ${totalActionsOnroom} on that date so update it or modify the room counts`,
        });
    }

    const _create = await new RoomConfigModel(data).save();

    // // no update the room Config in room data
    const _update = await HotelModel.findOneAndUpdate(
      {
        _id: hid,
        "rooms._id": rid,
      },
      {
        $push: { "rooms.$.roomConfig": _create._id },
      },
      { new: true }
    );

    if (!_create && !_update)
      return res
        .status(400)
        .json({ error: true, message: "error in creation " });
    res.status(200).json({
      error: false,
      message: "success",
      data: _create,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeletRoomConfig = async (req, res) => {
  const { id } = req.params;
  try {
    const _data = await RoomConfigModel.findById(id);
    const [_deletedRoom, _removedFromHotel] = await Promise.all([
      RoomConfigModel.findByIdAndDelete(id),
      HotelModel.findOneAndUpdate(
        {
          "rooms._id": _data.roomid,
        },
        { $pull: { "rooms.$.roomConfig": _data._id } },
        { new: true }
      ),
    ]);
    if (!_deletedRoom && _removedFromHotel.modifiedCount === 0)
      return res
        .status(404)
        .json({ error: true, message: "no data found with this id " });
    res.status(200).json({
      error: false,
      message: "success",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteAllRoomConfig = async (req, res) => {
  try {
    const [deletedRoomConfig, updatedHotelsRooms] = await Promise.all([
      RoomConfigModel.deleteMany({}),
      HotelModel.updateMany(
        { "rooms.roomConfig": { $exists: true } },
        { $pull: { "rooms.$.roomConfig": {} } },
        { new: true }
      ),
    ]);
    if (
      deletedRoomConfig.deletedCount === 0 ||
      updatedHotelsRooms.modifiedCount === 0
    ) {
      return res
        .status(404)
        .json({ error: true, message: "No data found to delete" });
    }

    res.status(200).json({ error: false, message: "Success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateRoomConfig = async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  try {
    const _update = await RoomConfigModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
    if (!_update)
      return res
        .status(400)
        .json({ error: true, message: "Invalid Id no data found" });
    res.status(200).json({ error: false, message: "success", data: _update });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllroomConfig = async (req, res) => {
  const { id } = req.query;
  try {
    const cred = id ? { _id: id } : {};
    const response = await RoomConfigModel.find(cred);
    if (!response)
      return res.status(404).json({ error: true, message: "No Data found" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const mongodbId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

module.exports = {
  createRoomConfig,
  DeletRoomConfig,
  DeleteAllRoomConfig,
  UpdateRoomConfig,
  GetAllroomConfig,
};
