import { Router } from 'express';
import logoutController from '../controllers/logoutController.js';

export default Router().get(`${process.env.BASE_ROUTE}/logout`, logoutController);
