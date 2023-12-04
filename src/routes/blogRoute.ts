import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import blogController from '../controllers/blogController';

export default Router().post(
  `${process.env.BASE_ROUTE}/blog-service`,
  verifyAuthor,
  blogController.insert
);
