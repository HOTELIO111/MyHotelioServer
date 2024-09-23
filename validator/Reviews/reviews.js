const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

// Reviews Validators

const CreateReviewDataValidate = async (req, res, next) => {
  const validateSchema = joi.object({
    message: joi.string(),
    ratings: joi.number(),
    valueOfMoney: joi.number(),
    cleanliness: joi.number(),
    comfort: joi.number(),
    customer: joi.string(),
    hotel: joi.string(),
    booking: joi.string().required(),
  });

  try {
    // Validate the request body against the schema
    const { error } = validateSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    // If validation passes, move to the next middleware
    next();
  } catch (error) {
    // If validation fails, send an error response
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { CreateReviewDataValidate };
