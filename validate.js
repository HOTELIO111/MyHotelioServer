const joi = require('joi')

// signup Validation
const SingupValidate = (data) => {
    const validationScheme = joi.object({
        name: joi.string().min(3).required(),
        mobileNo: joi.string().min(10).required(),
        email: joi.string().email().min(4).required(),
        location: joi.string().min(2),
        password: joi.string().min(6).required()
    })
    return validationScheme.validate(data)
}
const LoginValidate = (data) => {
    const validationScheme = joi.object({
        email: joi.string().min(4).required(),
        password: joi.string().min(6).required()
    })
    return validationScheme.validate(data)
}

module.exports = { SingupValidate, LoginValidate }