const mongoose = require("mongoose");

const FaqModel = require("./../Model/Faq/Faq");

const createFaq = async (req, res) => {
  const data = req.body;
  try {
    const response = await new FaqModel({
      ...data,
    }).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "please fill the required field " });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateFaq = async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  try {
    const response = await FaqModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );

    if (!response)
      return res.status(400).json({
        error: true,
        message: "please fill the required credentials ",
      });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// delete api
const DeleteTheFaq = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await FaqModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (response.deletedCount === 0)
      return res
        .status(400)
        .json({ error: true, message: "no data found with this id " });
    res.status(200).json({ error: false, message: "successfully deleted " });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllFaq = async (req, res) => {
  try {
    const data = await FaqModel.aggregate([{ $match: {} }]);
    if (!data)
      return res.status(404).json({ error: true, message: "no data found" });
    res.status(200).json({ error: false, message: "success", data: data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
const GetSingleFaq = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await FaqModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ]);
    if (!response)
      return res.status(404).json({ error: true, message: "no data found" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetFaqByField = async (req, res) => {
  const field = req.query;
  try {
    const data = await FaqModel.find(field);
    if (!data)
      return res
        .status(204)
        .json({ error: true, message: "no data found with this field " });
    res.status(200).json({ error: false, message: "success", data: data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  GetSingleFaq,
  GetAllFaq,
  DeleteTheFaq,
  UpdateFaq,
  createFaq,
  GetFaqByField,
};
