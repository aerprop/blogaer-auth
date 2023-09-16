import { Router } from 'express';
import baseController from '../controllers/baseController.js';

export default Router().get(process.env.BASE_ROUTE, baseController);
