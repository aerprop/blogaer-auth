import { Router } from 'express';
import loginController from '../controllers/loginController.js';

export default Router().post('/login', loginController);
