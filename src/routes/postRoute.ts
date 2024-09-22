import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import postController from '../controllers/postController';
import postTopicChan from '../middlewares/postTopicChan';
import postRpcChan from '../middlewares/postRpcChan';

export default Router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/post/user`, [
    postRpcChan,
    postController.getPostsByUserId
  ])
  .post(`${process.env.BASE_ROUTE}/post`, [
    postTopicChan,
    postController.addPost
  ])
  .patch(`${process.env.BASE_ROUTE}/post/:slug`, [
    postTopicChan,
    postController.patchPost
  ])
  .put(`${process.env.BASE_ROUTE}/post/:slug`, [
    postTopicChan,
    postController.updatePost
  ])
  .delete(`${process.env.BASE_ROUTE}/post/:slug`, [
    postTopicChan,
    postController.deletePost
  ]);
