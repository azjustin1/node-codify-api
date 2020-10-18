import Joi from 'joi'

const signUpValidation = data => {
    const schema = Joi.object({
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data)
}

const signInValidation = data => {
    const schema = Joi.object({
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data)
}

export { signUpValidation, signInValidation }  