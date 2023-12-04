import { Router } from 'express';
import baseController from '../controllers/baseController';

export default Router().get(process.env.BASE_ROUTE || '', baseController);
