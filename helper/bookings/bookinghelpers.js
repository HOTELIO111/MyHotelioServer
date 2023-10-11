const BookingModel = require("../../Model/Orders/orderModel");

const GetTheBookings = async ({ id, populated }) => {
  const tokenId = id === undefined ? {} : { _id: id };
  let response;
  console.log(populated);
  try {
    if (populated === "true") {
      response = await BookingModel.find(tokenId).populate({
        path: "hotelDetails",
        select:'_id  hotelName rooms address locality location vendorId hotelCoverImg hotelImages hotelMobileNo zipCode discription hotelEmail hotelType isPostpaidAllowed hotelRatings validAndTrueData notSupportDiscrimination termsAndCondition cancellationPolicy cancellationPrice'
      });
    } else {
      response = await BookingModel.find(tokenId);
    }

    return response;
  } catch (error) {
    return error;
  }
};

const CreateBooking = (formdata) => {
    try {
        // check the booking availibility
    } catch (error) {
        
    }
};

module.exports = { GetTheBookings };
