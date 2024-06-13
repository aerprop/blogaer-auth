import { Router } from 'express';
import testController from '../controllers/testController';

export default Router().get(`${process.env.BASE_ROUTE}/test`, testController);
