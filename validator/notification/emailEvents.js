const joi = require("joi");

const EmailEventAddValidator = (req, res, next) => {
  const formdata = req.body;

  try {
    const eventValidateSchema = joi.object({
      eventId: joi.string().required().min(6),
      requiredKeys: joi.object().required(),
      template: joi.string().required(),
      subject: joi.string().required().min(5),
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

module.exports = { EmailEventAddValidator };
