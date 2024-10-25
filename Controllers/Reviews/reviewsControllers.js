const { default: mongoose } = require("mongoose");
const ReviewsModel = require("../../Model/Reviews/Reviews");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");

// create Review api
const CreateReview = async (req, res) => {
  const data = req.body;
  try {
    const booking = await Booking.findById(data.booking).lean();
    const hotel = booking.hotel;
    const customer = booking.customer;
    const review = await ReviewsModel({
      ...data,
      customer,
      hotel,
    });

    const savedReview = await review.save();

    await HotelModel.findByIdAndUpdate(savedReview.hotel, {
      $push: { reviews: savedReview._id },
    });

    res
      .status(200)
      .json({ error: false, message: "Success", data: savedReview });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

//  Update the review
const UpdateTheReview = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedReview = await ReviewsModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: true, message: "Review not found" });
    }

    res
      .status(200)
      .json({ error: false, message: "Success", data: updatedReview });
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
              $cond: {
                if: { $eq: [{ $size: "$data" }, 0] },
                then: 0,
                else: {
                  $divide: [{ $sum: "$data.ratings" }, { $size: "$data" }],
                },
              },
            },
            fiveStars: {
              $size: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$data",
                      as: "singleData",
                      cond: { $eq: ["$$singleData.ratings", 5] },
                    },
                  },
                  [],
                ],
              },
            },
            fourStars: {
              $size: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$data",
                      as: "singleData",
                      cond: { $eq: ["$$singleData.ratings", 4] },
                    },
                  },
                  [],
                ],
              },
            },
            threeStars: {
              $size: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$data",
                      as: "singleData",
                      cond: { $eq: ["$$singleData.ratings", 3] },
                    },
                  },
                  [],
                ],
              },
            },
            twoStars: {
              $size: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$data",
                      as: "singleData",
                      cond: { $eq: ["$$singleData.ratings", 2] },
                    },
                  },
                  [],
                ],
              },
            },
            oneStars: {
              $size: {
                $ifNull: [
                  {
                    $filter: {
                      input: "$data",
                      as: "singleData",
                      cond: { $eq: ["$$singleData.ratings", 1] },
                    },
                  },
                  [],
                ],
              },
            },
          },
          valueOfMoney: {
            $multiply: [
              {
                $cond: {
                  if: { $eq: [{ $size: "$data" }, 0] },
                  then: 0,
                  else: {
                    $divide: [
                      { $sum: { $ifNull: ["$data.valueOfMoney", 0] } },
                      { $multiply: [{ $size: "$data" }, 5] },
                    ],
                  },
                },
              },
              100,
            ],
          },
          cleanliness: {
            $multiply: [
              {
                $cond: {
                  if: { $eq: [{ $size: "$data" }, 0] },
                  then: 0,
                  else: {
                    $divide: [
                      { $sum: { $ifNull: ["$data.cleanliness", 0] } },
                      { $multiply: [{ $size: "$data" }, 5] },
                    ],
                  },
                },
              },
              100,
            ],
          },
          comfort: {
            $multiply: [
              {
                $cond: {
                  if: { $eq: [{ $size: "$data" }, 0] },
                  then: 0,
                  else: {
                    $divide: [
                      { $sum: { $ifNull: ["$data.comfort", 0] } },
                      { $multiply: [{ $size: "$data" }, 5] },
                    ],
                  },
                },
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

const VendorAllHotelsReviewTogether = async (req, res) => {
  const { vendorid } = req.params;
  try {
    const response = await VendorModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(vendorid) } },
      {
        $lookup: {
          from: "hotels",
          localField: "hotels",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "reviews",
                localField: "reviews",
                foreignField: "_id",
                pipeline: [
                  {
                    $lookup: {
                      from: "hotels",
                      localField: "hotel",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            hotelName: 1,
                            hotelType: 1,
                            address: 1,
                            hotelCoverImg: 1,
                            hotelRatings: 1,
                          },
                        },
                      ],
                      as: "hotel",
                    },
                  },
                  {
                    $lookup: {
                      from: "customers",
                      localField: "customer",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            mobileNo: 1,
                            name: 1,
                            email: 1,
                            avatar: 1,
                          },
                        },
                      ],
                      as: "customer",
                    },
                  },
                  { $sort: { createdAt: -1 } },
                ],
                as: "reviews",
              },
            },
            { $unwind: "$reviews" },
            {
              $project: {
                reviews: 1,
              },
            },
          ],
          as: "hotels",
        },
      },
      {
        $project: {
          reviews: "$hotels.reviews",
        },
      },
    ]);
    res
      .status(200)
      .json({ error: false, message: "success", data: response[0].reviews });
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
  VendorAllHotelsReviewTogether,
};
