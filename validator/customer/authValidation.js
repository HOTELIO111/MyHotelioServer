const Joi = require('joi');


const signUpLoginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .when('mobile', {
            is: Joi.string().required(),
            then: Joi.forbidden(),
        }),

    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .when('email', {
            is: Joi.string().required(),
            then: Joi.forbidden(),
        }),

    password: Joi.string().min(6).required(),
});