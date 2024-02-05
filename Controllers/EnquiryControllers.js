const EnquiryModel = require("../Model/EnquiryMdel");

const CreateEnquiry = async (req, res) => {
  const formdata = req.body;

  try {
    const response = await new EnquiryModel(formdata).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "missing required credentials" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateEnquiryForm = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await EnquiryModel.findByIdAndUpdate(id, formdata, {
      new: true,
    });
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "missing required credentials" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteEnquireForm = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await EnquiryModel.findByIdAndDelete(id);
    if (!response)
      return res
        .status(404)
        .json({ error: true, message: "no data found with this id to delete" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetEnquiryDetails = async (req, res) => {
  try {
    const { id, search, from, to, sort } = req.query;

    let query = {};
    let sortOptions = {};

    if (id) {
      query = { _id: id };
    }
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
        ],
      };
    }
    if (from && to) {
      query = { createdAt: { $gte: new Date(from), $lt: new Date(to) } };
    }

    sortOptions = sort ? { createdAt: sort } : { createdAt: -1 };

    const response = await EnquiryModel.find(query).sort(sortOptions);
    res.status(200).json({ error: false, message: "Success", data: response });
  } catch (error) {
    console.error("Error in getEnquiryDetails:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const UpdateStatusEnquiry = async (req, res) => {
  const { id, status } = req.params;
  try {
    const response = await EnquiryModel.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      {
        new: true,
      }
    );
    if (!response)
      return res.status(400).json({ error: true, message: response });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateEnquiry,
  UpdateEnquiryForm,
  DeleteEnquireForm,
  GetEnquiryDetails,
  UpdateStatusEnquiry,
};
