import express from 'express';
import rootController from '../controllers/rootController';

export const rootRoute = express.Router().get('/', rootController);
