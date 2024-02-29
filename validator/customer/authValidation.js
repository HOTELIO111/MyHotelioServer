const Joi = require("joi");

const customerSignUp = async (req, res, next) => {
  const formdata = req.query;

  try {
    const eventValidateSchema = Joi.object({
      mobileNo: Joi.string().required(),
      otp: Joi.string().min(4).max(4),
      password: Joi.string(),
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



module.exports = { customerSignUp };
