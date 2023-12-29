const HotelModel = require("../Model/HotelModel/hotelModel");

const GetRoomCount = async (roomid) => {
  const hotel = await HotelModel.findOne({ "rooms._id": roomid });
  const roomCount = hotel.rooms?.find((x) => x._id === roomid).counts;
  return roomCount;
};

module.exports = { GetRoomCount };
