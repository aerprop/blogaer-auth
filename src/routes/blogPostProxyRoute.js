import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import blogPostProxyController from '../controllers/blogPostProxyController';

export default Router().all('/api/post-service/v1', verifyAuthor, blogPostProxyController);
