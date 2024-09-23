const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const ValidateBookingQuery = (req, res, next) => {
  const bookingSchema = Joi.object({
    //   bookingId: Joi.string().required(),
    room: Joi.objectId(),
    hotel: Joi.objectId(),
    // guest: Joi.object({
    //   name: Joi.string().required(),
    //   email: Joi.string().email().required(),
    //   mobileNo: Joi.number().min(10).required(),
    // }),
    guest: Joi.object(),
    merchant_param1: Joi.string().optional(),
    bookingDate: Joi.object({
      checkIn: Joi.string().required(),
      checkOut: Joi.string().required(),
    }).required(),
    amount: Joi.number().required(),
    dateOfBooking: Joi.string().required(),
    // payment: Joi.object({
    //   status: Joi.string().valid("pending").required(),
    // }).required(),
    // bookingStatus: Joi.string().valid("confirmed").required(),
    promoCode: Joi.string().min(3),
    numberOfGuests: Joi.object({
      adults: Joi.number().required(),
    }).required(),
    numberOfRooms: Joi.number().required(),
    bookingSource: Joi.string().required(),
    customer: Joi.objectId(),
    additionalCharges: Joi.object({
      gst: Joi.number().required(),
      cancellationCharge: Joi.number(),
      serviceFee: Joi.number(),
    }).required(),
    specialRequests: Joi.string().required(),
    discountInfo: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().required(),
      })
    ),
  });

  const { error } = bookingSchema.validate(req.body);

  console.log(error);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });
  }

  req.validatedData = req.body;
  next();
};

module.exports = ValidateBookingQuery;
