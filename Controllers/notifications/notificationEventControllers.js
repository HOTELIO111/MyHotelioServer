const EmailEventModel = require("../../Model/Notifications/EmailNotificationEvents");

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

module.exports = { CreateEventNotification };
