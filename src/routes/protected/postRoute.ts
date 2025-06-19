import verifyAuthor from '../../middlewares/verifyAuthor';
import postController from '../../controllers/postController';
import initPubTopicChan from '../../middlewares/messaging/initPubTopicChan';
import initPubConChan from '../../middlewares/messaging/initPubConChan';
import { router } from '../router';

const postRoute = router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/post/user`, [
    initPubConChan,
    postController.getPostsByUserId
  ])
  .post(`${process.env.BASE_ROUTE}/post`, [
    initPubTopicChan,
    postController.addPost
  ])
  .patch(`${process.env.BASE_ROUTE}/post`, [
    initPubTopicChan,
    postController.patchPost
  ])
  .delete(`${process.env.BASE_ROUTE}/post/:id`, [
    initPubTopicChan,
    postController.deletePost
  ]);

export default postRoute;
