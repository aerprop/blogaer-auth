import { body } from 'express-validator';

const authValidations = {
  registerValidations: [
    body('username')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Username must be at least 2 characters.'),
    body('email').isEmail().withMessage('Not a valid email address.'),
    body('password')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Password must be at least 4 characters.')
  ],
  loginValidations: [
    body('emailOrUsername')
      .trim()
      .notEmpty()
      .withMessage('Not a valid email address.'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password must not be empty.')
  ]
};

export default authValidations;
