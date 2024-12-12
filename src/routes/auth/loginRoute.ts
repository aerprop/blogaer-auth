import loginController from '../../controllers/auth/loginController';
import { body } from 'express-validator';
import validateRequest from '../../middlewares/validateRequest';
import { routerInit } from '../router';

const loginRoute = routerInit.post(`${process.env.BASE_ROUTE}/auth/login`, [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Not a valid email address.'),
  body('password').trim().notEmpty().withMessage('Password must not be empty.'),
  validateRequest,
  loginController
]);

export default loginRoute;
