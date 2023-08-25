import express from 'express';
import rootController from './controller/rootController';

const router = express.Router();

router.get('/', rootController.handleRoot);

export default router;
