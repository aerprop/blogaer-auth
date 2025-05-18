import verifyAuthor from '../../middlewares/verifyAuthor';
import postController from '../../controllers/postController';
import initPublisherChan from '../../middlewares/messaging/initPublisherChan';
import initPubConChan from '../../middlewares/messaging/initPubConChan';
import { router } from '../router';

const postRoute = router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/post/user`, [
    initPubConChan,
    postController.getPostsByUserId
  ])
  .post(`${process.env.BASE_ROUTE}/post`, [
    initPublisherChan,
    postController.addPost
  ])
  .patch(`${process.env.BASE_ROUTE}/post/:slug`, [
    initPublisherChan,
    postController.patchPost
  ])
  .put(`${process.env.BASE_ROUTE}/post/:slug`, [
    initPublisherChan,
    postController.updatePost
  ])
  .delete(`${process.env.BASE_ROUTE}/post/:slug`, [
    initPublisherChan,
    postController.deletePost
  ]);

export default postRoute;
