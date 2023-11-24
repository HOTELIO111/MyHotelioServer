const { default: mongoose } = require("mongoose");
const PopularLocations = require("../Model/popularLocations/locations");

const createPopularLocation = async (req, res) => {
  const data = req.body;
  try {
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
    const response = await PopularLocations.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $set: data },
    ]);

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
    const response = await PopularLocations.aggregate([{ $match: {} }]);
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

module.exports = {
  createPopularLocation,
  GetPopularLocationsByID,
  GetAllthePopularLocation,
  DeleteThePopularLocation,
  UpdatePopularLocation,
};
