import { Router } from 'express';
import { body } from 'express-validator';
import registerController from '../controllers/registerController.js';
import validateResult from '../middlewares/validateRequest.js';

const router = Router().post(
  `${process.env.BASE_ROUTE}/register`,
  [
    body('email').isEmail().withMessage('Not a valid email address.'),
    body('password')
      .trim()
      .isLength({ min: 4 })
      .withMessage('Password must be at least 4 characters.')
  ],
  validateResult,
  registerController
);

export default router;
