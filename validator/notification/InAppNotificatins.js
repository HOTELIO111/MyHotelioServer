const joi = require("joi");

const CreateInAppNotificationValidate = (req, res, next) => {
  const formdata = req.body;

  try {
    const eventValidateSchema = joi.object({
      recipient: joi.string().required(),
      message: joi.string().required(),
      moode: joi
        .string()
        .required()
        .valid(["info", "warning", "danger", "success"]),
      sender: joi.string().required(),
      subject: joi.string().required(),
      html: joi.string(),
      button: joi.array(),
    });

    const { value, error } = eventValidateSchema.validate(formdata);

    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};


module.exports = {CreateInAppNotificationValidate}