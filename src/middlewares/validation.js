const Joi = require('joi');

const schemas = {
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

module.exports = { validate };
