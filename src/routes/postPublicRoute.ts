import { Router } from 'express';
import postController from '../controllers/postController';
import postRpcChan from '../middlewares/postRpcChan';

export default Router()
  .use(postRpcChan)
  .get(`${process.env.BASE_ROUTE}/post/public`, postController.getPostsByPage)
  .get(
    `${process.env.BASE_ROUTE}/post/public/:slug`,
    postController.getPostById
  )
  .get(
    `${process.env.BASE_ROUTE}/post/public/explore`,
    postController.explorePosts
  );
