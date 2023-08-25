import express from 'express';
import loginController from '../controllers/loginController';

export const loginRoute = express.Router().post('/', loginController);
