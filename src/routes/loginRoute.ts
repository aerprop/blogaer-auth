import { Router } from 'express';
import loginController from '../controllers/loginController';

export default Router().post(
  `${process.env.BASE_ROUTE}/login`,
  loginController
);
