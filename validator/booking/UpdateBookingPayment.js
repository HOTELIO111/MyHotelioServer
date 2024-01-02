const Joi = require("joi");

const ValidatePaymentData = (req, res, next) => {
  try {
    const paymentSchema = Joi.object({
      order_id: Joi.string().min(4).required(),
      tracking_id: Joi.number().required(),
      bank_ref_no: Joi.string().required(),
      order_status: Joi.string().required(),
      failure_message: Joi.string().allow(""),
      payment_mode: Joi.string().required(),
      card_name: Joi.string().required(),
      status_code: Joi.number().allow(null),
      status_message: Joi.string().allow(""),
      currency: Joi.string().allow(""),
      amount: Joi.number().required(),
      billing_name: Joi.string().required().allow(""),
      billing_address: Joi.string().allow(""),
      billing_city: Joi.string().allow(""),
      billing_state: Joi.string().allow(""),
      billing_zip: Joi.number().allow(null),
      billing_country: Joi.string().allow(""),
      billing_tel: Joi.number().min(10).allow(null),
      billing_email: Joi.string().email().allow(""),
      trans_date: Joi.date().allow(null),
      offer_type: Joi.string().allow(""),
      offer_code: Joi.number().allow(null),
      discount_value: Joi.number().allow(null),
      mer_amount: Joi.number().allow(null),
      eci_value: Joi.string().allow(""),
      retry: Joi.string().allow(""),
      bin_country: Joi.string().allow(null),

    }).unknown(true);
    const { error } = paymentSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }

    req.validatedData = req.body;
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = ValidatePaymentData;
