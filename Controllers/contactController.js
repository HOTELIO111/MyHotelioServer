const ContactUsModel = require("../Model/contactModel");

const CreateContactSubmit = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await new ContactUsModel(formdata).save();
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await ContactUsModel.findByIdAndDelete(id);
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "no data found with this id to delete" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllContact = async (req, res) => {
  const { id, search, from, to, status, sort } = req.query;
  let _find;
  let _sort;
  try {
    if (id) {
      _find = { _id: id };
    }
    if (from && to) {
      _find = {
        createdAt: {
          $gte: new Date(from),
          $lt: new Date(to),
        },
      };
    }
    if (search) {
      _find = {
        disc: {
          $regex: search,
          $options: "i",
        },
      };
    }
    if (status) {
      _find = { status: status };
    }
    if (sort) {
      _sort = { createdAt: parseInt(sort) };
    } else {
      _sort = { createdAt: -1 };
    }
    const response = await ContactUsModel.find(_find).sort(_sort);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateContactStatus = async (req, res) => {
  const { id, status } = req.params;

  try {
    const response = await ContactUsModel.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateContactUs = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await ContactUsModel.findByIdAndUpdate(id, formdata, {
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

module.exports = {
  CreateContactSubmit,
  deleteContact,
  GetAllContact,
  UpdateContactStatus,
  UpdateContactUs,
};
