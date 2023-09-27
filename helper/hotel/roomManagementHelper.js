const HotelModel = require("../../Model/HotelModel/hotelModel");

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

module.exports = { UpdatetheRoomData };
