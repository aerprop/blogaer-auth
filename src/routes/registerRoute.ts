import { Router } from 'express';
import registerController from '../controllers/registerController';
import validateRequest from '../middlewares/validateRequest';

const router = Router().post(
  `${process.env.BASE_ROUTE}/register`,
  validateRequest,
  registerController
);

export default router;
