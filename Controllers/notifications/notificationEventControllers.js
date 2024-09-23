const EmailTemplates = require("../../Model/Notifications/EmailTemplates");
const SMSTemplates = require("../../Model/Notifications/MobileTemplates");
const NotificationsEventsModel = require("../../Model/Notifications/NotificationEvents");
const EmailEventModel = require("../../Model/Notifications/NotificationEvents");
const {
  EmailNotification,
  MobileNotification,
  NotificationsQueue,
  RefundQueue,
} = require("../../jobs");

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

const GetNotificationsEvents = async (req, res) => {
  const { id } = req.query;
  let _find = {};
  if (id) {
    _find = { _id: id };
  }
  const response = await EmailEventModel.find(_find);
  res.status(200).json({ error: false, message: "success", data: response });
  try {
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateNotificationEvents = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;

  try {
    const response = await EmailEventModel.findByIdAndUpdate(id, formdata, {
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
const DeleteNotificationEvents = async (req, res) => {
  const { id } = req.query;
  let _delete = {};
  if (id) {
    _delete = { _id: id };
  }
  try {
    const response = await EmailEventModel.deleteMany(_delete);
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
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "failed to update email Template" });
    res.status(200).json({ error: false, message: "success", data: response });
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

// ===================== Sms Templates ====================================

const CreateSmsTemplate = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await new SMSTemplates(formdata).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "missing required credentials" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetSmsTemplate = async (req, res) => {
  const { id } = req.query;
  let _find = {};
  if (id) {
    _find = { _id: id };
  }
  try {
    const response = await SMSTemplates.find(_find);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteSMSTemplate = async (req, res) => {
  const { id } = req.query;
  try {
    let _delete = {};
    if (id) {
      _delete = { _id: id };
    }
    const response = await SMSTemplates.deleteMany(_delete);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateSmsTemplate = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await SMSTemplates.findByIdAndUpdate(id, formdata, {
      new: true,
    });
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: " pleasse fill the required detials" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const TestingNotificationQueue = async (req, res) => {
  const { eventId } = req.params;
  try {
    await EmailNotification.add("your new Job", {
      eventId: eventId,
      customerName: "Abhishek Sharma",
      email: "abhisheksharma84457@gmail.com",
    });
    await EmailNotification.addBulk([
      {
        name: "send Notification to customer",
        data: {
          eventId: eventId,
          recipient: { email: "abhishektrickle@gmail.com", mobile: 7052237052 },
          customerName: "Abhishek Sharma",
        },
      },
      {
        name: "send Notification to Admin",
        data: {
          eventId: eventId,
          recipient: {
            email: "sourabhverma01.ts@gmail.com",
            mobile: 8090300447,
          },
          customerName: "Abhishek Sharma",
          subject: "New Customer Added on Hotelio Rooms - Abhishek Sharma",
        },
      },
    ]);
    res.status(200).json({
      error: false,
      message: `${eventId} send for the notifications`,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateEventNotification,
  GetNotificationsEvents,
  UpdateNotificationEvents,
  DeleteNotificationEvents,
  CreateEmailTemplate,
  UpdateEmailTemplates,
  GetAllEmailTemplates,
  DeleteEmailTemplates,
  CreateSmsTemplate,
  GetSmsTemplate,
  DeleteSMSTemplate,
  UpdateSmsTemplate,
  TestingNotificationQueue,
};
