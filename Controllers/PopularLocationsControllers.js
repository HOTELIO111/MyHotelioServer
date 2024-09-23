const { default: mongoose } = require("mongoose");
const PopularLocations = require("../Model/popularLocations/Locations");

const createPopularLocation = async (req, res) => {
  const data = req.body;
  try {
    const isFound = await PopularLocations.aggregate([
      { $match: { endpoint: data.endpoint } },
    ]);
    if (isFound[0])
      return res.status(409).json({
        error: true,
        message: "already record available with this endpoint",
      });
    const response = await new PopularLocations({
      ...data,
    }).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "please fill the required fields" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// update the location data
const UpdatePopularLocation = async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  try {
    const response = await PopularLocations.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );

    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "please fill the required fields" });
    res
      .status(200)
      .json({ error: false, message: "updated successfully ", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delete the About Locaiton
const DeleteThePopularLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await PopularLocations.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (response.deletedCount === 0)
      return res
        .status(404)
        .json({ error: true, message: "data not found with this id " });
    res.status(200).json({ error: false, message: "success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllthePopularLocation = async (req, res) => {
  try {
    const response = await PopularLocations.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "faqs",
          localField: "faq",
          foreignField: "_id",
          as: "faq",
        },
      },
    ]);
    if (!response)
      return res.status(204).json({ error: true, message: "no data found " });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetPopularLocationsByID = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await PopularLocations.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ]);
    if (!response)
      return res.status(204).json({ error: true, message: "no data found " });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// get thee data by endPoint

const GetByEndpoint = async (req, res) => {
  const { endpoint } = req.params;
  try {
    const response = await PopularLocations.aggregate([
      { $match: { endpoint: endpoint } },
      {
        $lookup: {
          from: "faqs",
          localField: "faq",
          foreignField: "_id",
          as: "faq",
        },
      },
    ]);
    if (!response)
      return res.status(404).json({ error: true, message: "no data found" });

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  createPopularLocation,
  GetPopularLocationsByID,
  GetAllthePopularLocation,
  DeleteThePopularLocation,
  UpdatePopularLocation,
  GetByEndpoint,
};
