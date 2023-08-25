import express from 'express';
import logoutController from '../controllers/logoutController';

export const logoutRoute = express.Router().get('/', logoutController);
