import { Router } from 'express';
import logoutController from '../controllers/logoutController.js';

export default Router().get('/logout', logoutController);
