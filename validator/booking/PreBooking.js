const Joi = require("joi");

module.exports = async function (req, res, next) {
  try {
    const bookingSchemaValidation = Joi.object({
      room: Joi.string(),
      hotel: Joi.string().required(),
      guest: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        mobileNo: Joi.number().min(10),
      }),
      bookingDate: Joi.object({
        checkIn: Joi.date().required(),
        checkOut: Joi.date()
          .required()
          .greater(Joi.ref("checkIn"))
          .message("Check-out date must be after check-in date"),
      }),
      amount: Joi.number().required(),
      dateOfBooking: Joi.date().required(),
      bookingStatus: Joi.string()
        .valid("confirmed", "canceled", "pending", "failed")
        .default("pending")
        .required(),
      additionalCharges: Joi.object({
        gst: Joi.number(),
        cancellationCharge: Joi.number(), // corrected spelling
        serviceFee: Joi.number(),
      }),
      promoCode: Joi.string(),
      discountInfo: Joi.array().items(
        Joi.object({
          type: Joi.string(),
          name: Joi.string(),
          expiry: Joi.date(),
          rate: Joi.number(),
        })
      ),
      numberOfGuests: Joi.object({
        adults: Joi.number().required(),
      }),
      numberOfRooms: Joi.number(),
      bookingSource: Joi.string(),
      customer: Joi.string().required(),
    });

    const formData = req.body;
    const isValidated = await bookingSchemaValidation.validate(formData);
    if (isValidated.error)
      return res.status(400).json(isValidated.error.details[0].message);

    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
