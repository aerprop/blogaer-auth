import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import blogController from '../controllers/blogController';

export default Router()
  .use(verifyAuthor)
  .post(
    `${process.env.BASE_ROUTE}/blog-service`,
    blogController.insert
  )
  .get(
    `${process.env.BASE_ROUTE}/blog-service`,
    blogController.get
  )
  .put(
    `${process.env.BASE_ROUTE}/blog-service`,
    blogController.update
  )
  .delete(
    `${process.env.BASE_ROUTE}/blog-service`,
    blogController.delete
  );
