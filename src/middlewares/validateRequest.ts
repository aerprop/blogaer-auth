import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const validateRequest = [
  body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters.'),
  body('email').isEmail().withMessage('Not a valid email address.'),
  body('password').trim().isLength({ min: 4 }).withMessage('Password must be at least 4 characters.'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'Bad request',
        message: 'Form validation error.',
        errors: errors.array()
      });
    }
    next();
  }
];

export default validateRequest;
