import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import postController from '../controllers/postController';
import rabbitMQConnection from '../middlewares/rabbitMQ';

export default Router()
  .use([verifyAuthor, rabbitMQConnection])
  .post(`${process.env.BASE_ROUTE}/post`, postController.addPost)
  .get(`${process.env.BASE_ROUTE}/post`, postController.getPostsByQuery)
  .get(`${process.env.BASE_ROUTE}/post/:postId`, postController.getPostById)
  .get(`${process.env.BASE_ROUTE}/post/explore`, postController.explorePosts)
  .put(`${process.env.BASE_ROUTE}/post/:postId`, postController.updatePost)
  .patch(`${process.env.BASE_ROUTE}/post/:postId`, postController.patchPost)
  .delete(`${process.env.BASE_ROUTE}/post/:postId`, postController.deletePost);
