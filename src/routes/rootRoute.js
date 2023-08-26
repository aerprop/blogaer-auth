import { Router } from 'express';
import rootController from '../controllers/rootController.js';

export default Router().get('/', rootController);
