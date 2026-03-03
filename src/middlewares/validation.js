const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    consent_given: Joi.boolean().valid(true).required()
      .messages({
        'any.only': 'You must agree to the SafeScan Privacy Policy and Disclaimer.',
        'boolean.base': 'Consent must be a boolean value.',
        'any.required': 'You must agree to the SafeScan Privacy Policy and Disclaimer.'
      }),
  }).unknown(false),

  login: Joi.object({
    email: Joi.string().email().required(),
  }).unknown(false),

  verify: Joi.object({
    token: Joi.string().required(),
  }).unknown(false),

  analyzeText: Joi.object({
    text: Joi.string().min(1).max(10000).required(),
  }).unknown(false),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }).unknown(false),

  scanWithCategory: Joi.object({
    productCategory: Joi.string().max(100).optional(),
  }).unknown(true),

  lookup: Joi.object({
    ingredient: Joi.string().min(1).max(200).required(),
  }).unknown(true),
};

const validate = (schemaName) => {
  return (req, res, next) => {
    const { error } = schemas[schemaName].validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    next();
  };
};

const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const { error } = schemas[schemaName].validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    next();
  };
};

module.exports = { validate, validateQuery };
