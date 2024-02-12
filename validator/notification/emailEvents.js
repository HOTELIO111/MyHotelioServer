const joi = require("joi");

const EmailEventAddValidator = (req, res, next) => {
  const formdata = req.body;

  try {
    const eventValidateSchema = joi.object({
      eventid: joi.string().required().min(6),
      templateKeys: joi.array().required(),
      templates: joi.object({
        email: joi.string(),
        sms: joi.string(),
      }),
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

// =========================== Email emplates  ====================================

const EmailTemplateValidate = async (req, res, next) => {
  const formdata = req.body;
  try {
    const validationSchema = joi.object({
      html: joi.string(),
      message: joi.string().min(0),
      eventid: joi.string().required(),
      title: joi.string().required(),
    });

    const { error } = validationSchema.validate(formdata);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ======================= Sms Templates =============================
const SmsTemplateValidate = async (req, res, next) => {
  const formdata = req.body;
  try {
    const validationSchema = joi.object({
      message: joi.string().min(0),
      eventid: joi.string().required(),
      title: joi.string().required(),
    });

    const { error } = validationSchema.validate(formdata);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
module.exports = {
  EmailEventAddValidator,
  EmailTemplateValidate,
  SmsTemplateValidate,
};
