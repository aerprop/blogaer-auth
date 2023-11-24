import { Router } from 'express';
import registerController from '../controllers/registerController.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router().post(
  `${process.env.BASE_ROUTE}/register`,
  validateRequest,
  registerController
);

export default router;
