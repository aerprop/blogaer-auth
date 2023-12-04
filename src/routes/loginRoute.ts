import { Router } from 'express';
import loginController from '../controllers/loginController';
import validateResult from '../middlewares/validateRequest';
import { body } from 'express-validator';

const router = Router().post(
  `${process.env.BASE_ROUTE}/login`,
  [
    body('email').isEmail().withMessage('Not a valid email address.'),
    body('password').trim().notEmpty().withMessage('Password must not be empty.')
  ],
  validateResult,
  loginController
);

export default router;
