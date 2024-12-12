import registerController from '../../controllers/auth/registerController';
import validateRequest from '../../middlewares/validateRequest';
import { body } from 'express-validator';
import { routerInit } from '../router';

const registerRoute = routerInit.post(`${process.env.BASE_ROUTE}/register`, [
  body('username')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters.'),
  body('email').isEmail().withMessage('Not a valid email address.'),
  body('password')
    .trim()
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters.'),
  validateRequest,
  registerController
]);

export default registerRoute;
