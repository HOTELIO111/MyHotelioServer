const Joi = require("joi");

const customerSignUp = (req, res, next) => {
  const formdata = req.query;

  try {
    const eventValidateSchema = joi.object({
      mobileNo: joi.String(),
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
