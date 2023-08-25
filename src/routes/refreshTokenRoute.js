import express from 'express';
import refreshTokenController from '../controllers/refreshTokenController';

export const refreshTokenRoute = express
  .Router()
  .get('/', refreshTokenController);
