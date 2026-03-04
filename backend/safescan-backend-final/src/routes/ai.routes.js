const router = require('express').Router();
const aiController = require('../controllers/ai.controller');
const requireAuth = require('../middlewares/requireAuth');
const { validate } = require('../middlewares/validation');

// Validation schema for explainIngredients
const explainIngredientsSchema = {
  ingredients: (() => {
    const Joi = require('joi');
    return Joi.array()
      .items(Joi.string().min(2).max(80).trim().required())
      .min(1)
      .max(30)
      .required()
      .messages({
        'array.min': 'ingredients must contain at least 1 item',
        'array.max': 'ingredients must contain at most 30 items',
        'string.min': 'each ingredient must be at least 2 characters',
        'string.max': 'each ingredient must be at most 80 characters',
        'any.required': 'ingredients is required',
        'array.base': 'ingredients must be an array of strings'
      });
  })()
};

// Custom validation middleware that returns specific error message
const validateIngredients = (req, res, next) => {
  const Joi = require('joi');
  const schema = Joi.array()
    .items(Joi.string().min(2).max(80).trim().required())
    .min(1)
    .max(30)
    .required();

  const { error, value } = schema.validate(req.body.ingredients);

  if (error) {
    return res.status(400).json({
      error: 'ingredients must be an array of strings'
    });
  }

  // Check for empty strings after trim
  const hasEmptyStrings = value.some(item => !item || item.trim() === '');
  if (hasEmptyStrings) {
    return res.status(400).json({
      error: 'ingredients must be an array of strings'
    });
  }

  req.body.ingredients = value;
  next();
};

// GET /health - Health check for AI service (public, no auth required)
router.get('/health', aiController.health);

// POST /explain - Explain ingredients using AI (protected, requires auth)
router.post('/explain', requireAuth, validateIngredients, aiController.explainIngredients);

module.exports = router;
