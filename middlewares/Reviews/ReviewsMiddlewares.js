const HotelModel = require("../../Model/HotelModel/hotelModel");
const ReviewsModel = require("../../Model/Reviews/Reviews");

const DeleteReviewsMiddleWare = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ error: true, message: "Review ID is required" });
    }
    const _find = await ReviewsModel.findById(id);
    if (!_find)
      return res
        .status(400)
        .json({ error: true, message: "review Already Deleted " });
    const removeHotelReview = await HotelModel.findByIdAndUpdate(
      { _id: _find.hotel },
      { $pull: { reviews: id } },
      { new: true }
    );
    if (!removeHotelReview)
      return res.status(400).json({
        error: true,
        message: "something error please try again later",
      });
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { DeleteReviewsMiddleWare };
