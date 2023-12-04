import { Router } from 'express';
import refreshTokenController from '../controllers/refreshTokenController';

export default Router().get(`${process.env.BASE_ROUTE}/refresh`, refreshTokenController);
