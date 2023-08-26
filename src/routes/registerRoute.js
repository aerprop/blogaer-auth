import { Router } from 'express';
import registerController from '../controllers/registerController.js';

export default Router().post('/register', registerController);
