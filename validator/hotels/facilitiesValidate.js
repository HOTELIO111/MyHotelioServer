const Joi = require('joi');

module.exports = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(2),
        isPaid: Joi.boolean(),
        price: Joi.when('isPaid', {
            is: true,
            then: Joi.string().required()
        })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: true, message: error.details[0].message });
    }

    next();
};
