const EmailTemplates = require("../../Model/Notifications/EmailTemplates");
const EmailEventModel = require("../../Model/Notifications/NotificationEvents");

const CreateEventNotification = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await new EmailEventModel(formdata).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "required data missing" });

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

//  ============================ Email Templates ================================

const CreateEmailTemplate = async (req, res) => {
  const formdata = req.body;

  try {
    const newData = new EmailTemplates(formdata);
    const response = await newData.save();
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateEmailTemplates = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await EmailTemplates.findByIdAndUpdate(id, formdata, {
      new: true,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllEmailTemplates = async (req, res) => {
  const { eventid, id } = req.query;

  let _find = {};
  try {
    if (eventid) {
      _find = { eventid: eventid };
    }
    if (id) {
      _find = { _id: id };
    }
    const response = await EmailTemplates.find(_find);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteEmailTemplates = async (req, res) => {
  const { id } = req.params;
  try {
    const [eventData, idData] = await Promise.all([
      EmailTemplates.findOne({ eventid: id }),
      EmailTemplates.findById(id),
    ]);
    let response;
    if (eventData) {
      response = await EmailTemplates.deleteMany({ eventid: id });
    }
    if (idData) {
      response = await EmailTemplates.deleteMany({ _id: id });
    }
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateEventNotification,
  CreateEmailTemplate,
  UpdateEmailTemplates,
  GetAllEmailTemplates,
  DeleteEmailTemplates,
};
