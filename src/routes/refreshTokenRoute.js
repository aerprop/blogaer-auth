import { Router } from 'express';
import refreshTokenController from '../controllers/refreshTokenController.js';

export default Router().get('/refresh', refreshTokenController);
