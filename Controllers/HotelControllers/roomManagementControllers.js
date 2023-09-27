const HotelModel = require("../../Model/HotelModel/hotelModel");
const {
  UpdatetheRoomData,
} = require("../../helper/hotel/roomManagementHelper");

const UpdateRoomData = async (req, res) => {
  const { hotelid, roomid } = req.params;

  try {
    const isUpdated = await UpdatetheRoomData(hotelid, roomid, req.body);

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

  try {
    const data = await HotelModel.findById(hotelid);
    if (!data)
      return res.status(404).json({ error: true, message: "hotel not found" });

    res
      .status(200)
      .json({ error: false, message: "success", data: data.rooms });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delete the room type

const DeleteRoomDataFromHotel = async (req, res) => {
  const { hotelid, roomid } = req.params;
  console.log(hotelid, roomid);
  try {
    const isDeleted = await HotelModel.findOneAndUpdate(
      { _id: hotelid },
      { $pull: { rooms: { _id: roomid } } }
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

module.exports = {
  UpdateRoomData,
  AddRoomType,
  GetAllRoomOfSingleHotel,
  DeleteRoomDataFromHotel,
};
