import { Router } from 'express';
import loginController from '../controllers/loginController.js';
import validateResult from '../middlewares/validateRequest.js';
import { body } from 'express-validator';

const router = Router().post(
  '/login',
  [
    body('email').isEmail().withMessage('Not a valid email address.'),
    body('password').trim().notEmpty().withMessage('Password must not be empty.')
  ],
  validateResult,
  loginController
);

export default router;
