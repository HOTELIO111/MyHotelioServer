const HotelModel = require("../../Model/HotelModel/hotelModel");
const ReviewsModel = require("../../Model/Reviews/Reviews");

const DeleteReviewsMiddleWare = async (req, res, next) => {
  const { id } = req.params;
  try {
    const _find = id !== "all" ? { _id: id } : {};
    const allReviews = await ReviewsModel.find(_find);
    const allIds = allReviews.map((item) => item._id);
    let response;
    if (id.toLowerCase() === "all") {
      response = await HotelModel.updateMany(
        {},
        {
          $pullAll: { reviews: allIds },
        }
      );
    } else {
      response = await HotelModel.updateMany(
        { _id: id },
        {
          $pullAll: { reviews: allIds },
        }
      );
    }
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { DeleteReviewsMiddleWare };
