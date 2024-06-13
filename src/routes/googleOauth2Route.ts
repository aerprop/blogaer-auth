import { Router } from 'express';
import googleOauth2Controller from '../controllers/googleOauth2Controller';

export default Router().post(
  `${process.env.BASE_ROUTE}/auth/google`,
  googleOauth2Controller
);
