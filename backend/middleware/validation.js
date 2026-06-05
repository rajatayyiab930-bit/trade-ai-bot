const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

const tradeValidation = [
  body('symbol').notEmpty().withMessage('Symbol required'),
  body('tradeType').isIn(['buy', 'sell']).withMessage('Invalid trade type'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be positive'),
  body('orderType').optional().isIn(['market', 'limit', 'stop_loss', 'take_profit']),
  validate,
];

module.exports = { registerValidation, loginValidation, tradeValidation };
