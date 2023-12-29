const HotelCategoryModel = require("../../Model/HotelModel/HotelCategoryModel");

const CreateFilter = async (req, res) => {
  const data = req.body;

  try {
    const response = await new HotelCategoryModel({ ...data }).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "Fields are Required" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateFilter = async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  try {
    const update = await HotelCategoryModel.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
    if (!update)
      return res
        .status(400)
        .json({ error: true, message: "fields are requried" });
    res.status(200).json({ error: false, message: "succes", data: update });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllTheCategories = async (req, res) => {
  const { id } = req.query;
  const find = id ? { _id: id } : {};
  try {
    const data = await HotelCategoryModel.find(find);
    if (!data)
      return res.status(404).json({ error: true, message: "no data found" });
    res.status(200).json({ error: false, message: "success", data: data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteTheHotelFilter = async (req, res) => {
  const { id } = req.params;
  const dele = id.toLowerCase() !== "all" ? { _id: id } : {};
  try {
    const _deleted = await HotelCategoryModel.deleteMany(dele);
    if (_deleted.deletedCount === 0)
      return res
        .status(404)
        .json({ error: true, message: "no data found with this id " });
    res.status(200).json({ error: false, message: "success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateFilter,
  UpdateFilter,
  GetAllTheCategories,
  DeleteTheHotelFilter,
};
