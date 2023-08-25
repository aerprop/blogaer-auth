import express from 'express';
import registerController from '../controllers/registerController';

export const registerRoute = express.Router.post('/register', registerController);
