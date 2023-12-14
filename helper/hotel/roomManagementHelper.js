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

module.exports = { UpdatetheRoomData, GetSingleRoomAllBookings };
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
