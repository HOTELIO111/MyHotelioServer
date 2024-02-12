const { default: mongoose } = require("mongoose");
const ReviewsModel = require("../../Model/Reviews/Reviews");
const HotelModel = require("../../Model/HotelModel/hotelModel");

// create Review api
const CreateReview = async (req, res) => {
  const data = req.body;
  try {
    const response = await new ReviewsModel({ ...data }).save();

    const add_id_inHotel = await HotelModel.findByIdAndUpdate(response.hotel, {
      $push: { reviews: response._id },
    });
    if (!response && !add_id_inHotel)
      return res
        .status(400)
        .json({ error: true, message: "please fill the required data" });

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

//  Update the review
const UpdateTheReview = async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  try {
    const response = await ReviewsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $set: data },
    ]);
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "please Fill the required fields" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delete the review
const DeleteTheReview = async (req, res) => {
  const { id } = req.params;

  const deleteCred =
    id === "all" ? {} : { _id: new mongoose.Types.ObjectId(id) };

  try {
    const isDeleted = await ReviewsModel.deleteMany(deleteCred);

    if (isDeleted.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "No reviews found with this id" });
    }
    res
      .status(200)
      .json({ error: false, message: "Reviews successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

const GetAllReviews = async (req, res) => {
  try {
    const allReviews = await ReviewsModel.find({});
    if (!allReviews)
      return res.status(404).json({ error: true, message: "no data found " });
    res
      .status(200)
      .json({ error: false, message: "success", data: allReviews });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
const GetSingleReview = async (req, res) => {
  const { id } = req.params;
  try {
    const allReviews = await ReviewsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
    ]);
    if (!allReviews)
      return res.status(404).json({ error: true, message: "no data found " });
    res
      .status(200)
      .json({ error: false, message: "success", data: allReviews });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
// get all the review with the specific field match
const GetTheReviewsByMatchingFields = async (req, res) => {
  const query = req.query;

  // Convert string values to their corresponding data types
  Object.keys(query).forEach((key) => {
    if (!isNaN(query[key])) {
      query[key] = parseFloat(query[key]);
    } else if (query[key] === "true" || query[key] === "false") {
      query[key] = query[key] === "true";
    }
    // Add more checks for other data types if needed
  });

  try {
    const getData = await ReviewsModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotel",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking",
          foreignField: "_id",
          as: "booking",
        },
      },
    ]);

    if (!getData || getData.length === 0)
      return res.status(404).json({
        error: true,
        message: "No data found with these credentials.",
      });

    res.status(200).json({ error: false, message: "Success", data: getData });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get Review By Hotel
const GethotelReviews = async (req, res) => {
  const { hotelid } = req.params;
  try {
    const _reviewAnalytics = await ReviewsModel.aggregate([
      {
        $facet: {
          data: [
            { $match: { hotel: new mongoose.Types.ObjectId(hotelid) } },
            {
              $sort: {
                ratings: -1,
                valueOfMoney: -1,
                cleanliness: -1,
                comfort: -1,
              },
            },
          ],
        },
      },
      {
        $project: {
          ratings: {
            overall: {
              $divide: [{ $sum: "$data.ratings" }, { $size: "$data" }],
            },
            fiveStars: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "singleData",
                  cond: { $eq: ["$$singleData.ratings", 5] },
                },
              },
            },
            fourStars: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "singleData",
                  cond: { $eq: ["$$singleData.ratings", 4] },
                },
              },
            },
            threeStars: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "singleData",
                  cond: { $eq: ["$$singleData.ratings", 3] },
                },
              },
            },
            twoStars: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "singleData",
                  cond: { $eq: ["$$singleData.ratings", 2] },
                },
              },
            },
            oneStars: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "singleData",
                  cond: { $eq: ["$$singleData.ratings", 1] },
                },
              },
            },
          },
          valueOfMoney: {
            $multiply: [
              {
                $divide: [
                  {
                    $sum: "$data.valueOfMoney",
                  },
                  { $multiply: [{ $size: "$data" }, 5] },
                ],
              },
              100,
            ],
          },
          cleanliness: {
            $multiply: [
              {
                $divide: [
                  {
                    $sum: "$data.cleanliness",
                  },
                  { $multiply: [{ $size: "$data" }, 5] },
                ],
              },
              100,
            ],
          },
          comfort: {
            $multiply: [
              {
                $divide: [
                  {
                    $sum: "$data.comfort",
                  },
                  { $multiply: [{ $size: "$data" }, 5] },
                ],
              },
              100,
            ],
          },
          reviews: "$data",
        },
      },
    ]);

    res
      .status(200)
      .json({ error: false, message: "success", data: _reviewAnalytics });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const MakeTimeLineReview = async (req, res) => {
  const { id, status } = req.params;

  try {
    const response = await ReviewsModel.findByIdAndUpdate(
      id,
      {
        timeline: status,
      },
      {
        new: true,
      }
    );
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "please check the id and status" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetTheTimelineReviews = async (req, res) => {
  try {
    const response = await ReviewsModel.aggregate([
      {
        $match: { timeline: true },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateReview,
  GetTheReviewsByMatchingFields,
  GetAllReviews,
  DeleteTheReview,
  UpdateTheReview,
  GetSingleReview,
  GethotelReviews,
  MakeTimeLineReview,
  GetTheTimelineReviews,
};
