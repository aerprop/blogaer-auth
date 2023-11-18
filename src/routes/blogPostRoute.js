import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import blogPostController from '../controllers/blogPostController';

export default Router().all(
  `${process.env.BASE_ROUTE}/post-service`,
  verifyAuthor,
  blogPostController
);
