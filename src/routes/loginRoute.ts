import { Router } from 'express';
import loginController from '../controllers/loginController';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

export default Router().post(`${process.env.BASE_ROUTE}/auth/login`, [
  body('emailOrUsername').trim().notEmpty().withMessage('Not a valid email address.'),
  body('password').trim().notEmpty().withMessage('Password must not be empty.'),
  validateRequest,
  loginController
]);
